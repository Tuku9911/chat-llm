import { useState, useRef, useEffect } from "react";
import type { Persona, ChatMessage } from "../types";
import { listMessages, addMessage } from "../db";
import { mockGenerateReply, streamText, generateOpenAIReply, generateWorkerReply } from "../llm";
import { uid } from "../utils/uid";

interface UseChatOptions {
  apiKey?: string;
  workerUrl?: string; // Cloudflare Worker URL (preferred)
  useOpenAI?: boolean;
  onQuotaError?: () => void; // Callback when quota error occurs
}

export function useChat(persona: Persona | undefined, options?: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!persona) {
      setMessages([]);
    }
  }, [persona]);

  async function loadMessages(personaId: string) {
    const ms = await listMessages(personaId);
    setMessages(ms);
  }

  function clearMessages() {
    setMessages([]);
  }

  function abortStreaming() {
    if (streaming) {
      abortRef.current?.abort();
    }
  }

  async function sendMessage(text: string) {
    if (!persona) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    abortStreaming();

    const userMsg: ChatMessage = {
      id: uid(),
      personaId: persona.id,
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    await addMessage(userMsg);

    // create assistant placeholder
    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      personaId: persona.id,
      role: "assistant",
      content: "",
      createdAt: Date.now() + 1,
    };
    setMessages(prev => [...prev, assistantMsg]);
    await addMessage(assistantMsg);

    setStreaming(true);
    const ac = new AbortController();
    abortRef.current = ac;

    // Track accumulated content
    let accumulatedContent = "";

    const updateContent = async (delta: string) => {
      accumulatedContent += delta;
      
      // Update state - always use current accumulated content to avoid duplication
      setMessages(prev =>
        prev.map(m => (m.id === assistantId ? { ...m, content: accumulatedContent } : m))
      );
      
      // Update assistantMsg for potential DB persistence
      assistantMsg.content = accumulatedContent;
    };

    try {
      const historyForGen = [...messages, userMsg];

      if (options?.useOpenAI) {
        // Priority 1: Use Cloudflare Worker if available (recommended)
        if (options?.workerUrl) {
          try {
            await generateWorkerReply(
              options.workerUrl,
              persona,
              historyForGen,
              updateContent,
              ac.signal
            );
          } catch (workerError) {
            // Fallback to direct API if worker fails
            if (options?.apiKey) {
              await generateOpenAIReply(
                options.apiKey,
                persona,
                historyForGen,
                updateContent,
                ac.signal
              );
            } else {
              throw workerError;
            }
          }
        } 
        // Priority 2: Use direct OpenAI API (client-side, less secure)
        else if (options?.apiKey) {
          try {
            await generateOpenAIReply(
              options.apiKey,
              persona,
              historyForGen,
              updateContent,
              ac.signal
            );
          } catch (openaiError) {
            // Check if it's a quota/billing error (429 or similar)
            const errorMsg = openaiError instanceof Error ? openaiError.message : String(openaiError);
            const isQuotaError = errorMsg.includes("429") || 
                                errorMsg.includes("quota") || 
                                errorMsg.includes("billing") ||
                                errorMsg.includes("insufficient") ||
                                errorMsg.includes("Too Many Requests");

            if (isQuotaError) {
              // Notify parent component about quota error
              options?.onQuotaError?.();
              
              // Fallback to mock LLM
              const fallbackMsg = "⚠️ OpenAI quota exceeded. Switching to Mock LLM.\n\n";
              
              // Update message to show fallback notice
              setMessages(prev =>
                prev.map(m => 
                  m.id === assistantId ? { ...m, content: fallbackMsg } : m
                )
              );
              assistantMsg.content = fallbackMsg;
              await addMessage({ ...assistantMsg });

              // Generate mock reply
              const fullReply = mockGenerateReply(persona, historyForGen);
              await streamText(fullReply, updateContent, ac.signal);
            } else {
              // Other errors - rethrow to be caught by outer catch
              throw openaiError;
            }
          }
        }
      } else {
        // Use mock LLM
        const fullReply = mockGenerateReply(persona, historyForGen);
        await streamText(fullReply, updateContent, ac.signal);
      }
    } catch (e) {
      // aborted is ok, but show other errors
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        console.error("Error generating reply:", e);
        const errorMsg = e instanceof Error ? e.message : "Failed to generate reply";
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: `❌ Error: ${errorMsg}` } : m
          )
        );
        await addMessage({ ...assistantMsg, content: `❌ Error: ${errorMsg}` });
      }
    } finally {
      setStreaming(false);
      // Final save to DB after streaming completes
      if (assistantMsg.content) {
        await addMessage(assistantMsg);
      }
    }
  }

  return {
    messages,
    streaming,
    loadMessages,
    clearMessages,
    sendMessage,
    abortStreaming,
  };
}
