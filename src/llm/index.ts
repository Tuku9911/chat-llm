import OpenAI from "openai";
import type { Persona, ChatMessage } from "../types";

function buildPersonaPrompt(p: Persona) {
  return `You are roleplaying as "${p.name}".
Birthdate: ${p.birthdate}
Lived place: ${p.livedPlace}
Gender: ${p.gender}
Details: ${p.details}

Rules:
- Reply in a style consistent with the persona.
- Keep it helpful and friendly.
- Respond in the user's language (English or Japanese) based on the last user message.
`;
}

// Very simple mock generator - generates meaningful responses based on user input
export function mockGenerateReply(persona: Persona, history: ChatMessage[]): string {
  // Filter only user and assistant messages (exclude system)
  const chatHistory = history.filter(m => m.role === "user" || m.role === "assistant");
  const lastUser = [...chatHistory].reverse().find(m => m.role === "user")?.content ?? "";
  
  // If no user message found, return default greeting
  if (!lastUser || lastUser.trim() === "") {
    return `Hello! I'm ${persona.name || "a persona"}. How can I help you today?`;
  }

  const userMessage = lastUser.trim();
  const isJa = /[\u3040-\u30ff\u4e00-\u9faf]/.test(userMessage);

  // Persona-specific responses that actually use the user's message
  const nameLower = persona.name.toLowerCase();
  
  // Generate a meaningful response based on user message
  function generateResponse(userMsg: string, personaName: string, isJa: boolean): string {
    
    // Greeting detection
    if (/^(hi|hello|hey|こんにちは|こんばんは|おはよう)/i.test(userMsg)) {
      if (nameLower.includes("steve") && nameLower.includes("jobs")) {
        return isJa 
          ? "こんにちは。シンプルさこそが究極の洗練さです。今日は何について話しましょうか？"
          : "Hello. Simplicity is the ultimate sophistication. What would you like to discuss today?";
      } else if (nameLower.includes("elon")) {
        return isJa
          ? "こんにちは。私は合理性とスピードを重視します。何について話しますか？"
          : "Hi there. I focus on speed and first principles. What's on your mind?";
      } else {
        return isJa
          ? `こんにちは！${personaName || "ペルソナ"}です。何かお手伝いできることはありますか？`
          : `Hello! I'm ${personaName || "a persona"}. How can I help you today?`;
      }
    }
    
    // Question detection
    if (/\?/.test(userMsg) || /^(what|how|why|when|where|who|なに|どう|なぜ|いつ|どこ)/i.test(userMsg)) {
      if (nameLower.includes("steve") && nameLower.includes("jobs")) {
        return isJa
          ? `「${userMsg}」について、シンプルに答えましょう。\n\n要点を明確にすると：\n- 核心的な答え：これは製品設計やユーザー体験の本質に関わる重要な質問です。\n- 理由：シンプルさが最も難しく、洗練された解決策を生み出します。\n- 次のステップ：ユーザーの視点に立ち、複雑さを排除することです。`
          : `Regarding "${userMsg}" - let me keep it simple.\n\nHere's my perspective:\n- The core answer: This touches on the essence of product design and user experience.\n- Why this matters: Simplicity is the ultimate sophistication and creates elegant solutions.\n- Next step: Always focus on the user's perspective and eliminate complexity.`;
      } else if (nameLower.includes("elon")) {
        return isJa
          ? `「${userMsg}」について：\n結論：第一原理から考えると、解決策は明確です。\n理由：複雑さを減らし、根本的な問題に焦点を当てることが重要です。\n次の一手：迅速に行動し、反復的に改善していくことです。`
          : `About "${userMsg}":\nConclusion: Thinking from first principles, the solution is clear.\nReason: It's crucial to reduce complexity and focus on fundamental problems.\nNext step: Move fast and iterate to improve continuously.`;
      } else {
        return isJa
          ? `「${userMsg}」について考えてみます。\n\n私の考え：\n- この質問の要点は、本質的な理解と実践的な解決策を見つけることです。\n- 理由：${persona.details || "詳細な分析により、より良い結果を得られます"}。\n- 次のステップ：具体的な行動を起こし、継続的に改善していくことです。`
          : `Thinking about "${userMsg}"...\n\nMy thoughts:\n- The essence of this question is finding deep understanding and practical solutions.\n- Why: ${persona.details || "Through careful analysis, we can achieve better outcomes"}.\n- Next steps: Take concrete action and continuously improve.`;
      }
    }
    
    // Generic response that uses the actual user message
    if (nameLower.includes("steve") && nameLower.includes("jobs")) {
      return isJa
        ? `「${userMsg}」について。\n\nシンプルさを追求すると：\n- 核心：${userMsg}の本質を理解することが重要です。\n- 理由：ユーザーが求めているのは、複雑さではなく美しさと使いやすさです。\n- 次のステップ：この原則に基づいて行動を起こしましょう。`
        : `About "${userMsg}".\n\nPursuing simplicity:\n- Core: Understanding the essence of ${userMsg} is crucial.\n- Why: Users want beauty and ease of use, not complexity.\n- Next step: Let's act based on this principle.`;
    } else if (nameLower.includes("elon")) {
      return isJa
        ? `「${userMsg}」について。\n\n第一原理から考えると：\n- 結論：${userMsg}に関して、根本的な解決策を探ることが重要です。\n- 理由：スピードと効率が鍵となります。\n- 次の一手：迅速に実行し、データに基づいて改善していきます。`
        : `About "${userMsg}".\n\nFrom first principles:\n- Conclusion: Regarding ${userMsg}, finding fundamental solutions is key.\n- Reason: Speed and efficiency are crucial.\n- Next step: Execute quickly and improve based on data.`;
    } else {
      // Generic persona response
      return isJa
        ? `「${userMsg}」について理解しました。\n\n${persona.name || "ペルソナ"}としての考え：\n- ${userMsg}という点について、${persona.details || "私の経験と知識を活かして"}答えます。\n- 重要なのは、明確な目標を持ち、一歩ずつ前進することです。\n- 具体的な行動を起こし、結果を検証しながら進めていきましょう。`
        : `I understand regarding "${userMsg}".\n\nAs ${persona.name || "this persona"}, here's my perspective:\n- About ${userMsg}, I'll respond ${persona.details || "based on my experience and knowledge"}.\n- What matters is having clear goals and progressing step by step.\n- Let's take concrete action and move forward while verifying results.`;
    }
  }

  return generateResponse(userMessage, persona.name, isJa);
}

/**
 * Streams text by chunks to simulate LLM streaming.
 */
export async function streamText(
  fullText: string,
  onDelta: (delta: string) => void,
  signal?: AbortSignal
) {
  const chunkSize = 3; // tweak for faster/slower "stream"
  for (let i = 0; i < fullText.length; i += chunkSize) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const chunk = fullText.slice(i, i + chunkSize);
    onDelta(chunk);
    await new Promise(r => setTimeout(r, 25));
  }
}

/**
 * Generates reply using Cloudflare Worker (recommended for production).
 */
export async function generateWorkerReply(
  workerUrl: string,
  persona: Persona,
  history: ChatMessage[],
  onDelta: (delta: string) => void,
  signal?: AbortSignal
) {
  const response = await fetch(workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      persona: {
        name: persona.name,
        birthdate: persona.birthdate,
        livedPlace: persona.livedPlace,
        gender: persona.gender,
        details: persona.details,
      },
      history: history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Worker error: ${error.error || response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response body");
  }

  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || "";
            if (delta) {
              onDelta(delta);
            }
          } catch (e) {
            // Ignore JSON parse errors for incomplete chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Generates reply using OpenAI API with streaming (client-side, not recommended for production).
 */
export async function generateOpenAIReply(
  apiKey: string,
  persona: Persona,
  history: ChatMessage[],
  onDelta: (delta: string) => void,
  signal?: AbortSignal
) {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // ⚠️ Only for client-side usage
  });

  const systemPrompt = buildPersonaPrompt(persona);

  // Convert history to OpenAI format
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }) as OpenAI.Chat.Completions.ChatCompletionMessageParam),
  ];

  // Validate API key before making request
  if (!apiKey || !apiKey.trim().startsWith("sk-")) {
    throw new Error("Invalid API key format");
  }

  try {
    // Using /v1/chat/completions endpoint (correct for OpenAI API)
    // Note: /v1/responses doesn't exist - chat/completions is the correct endpoint
    const stream = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini", // ✅ Using gpt-4o-mini (cheaper, no billing required)
        // ❌ gpt-4 / gpt-4o require paid billing
        messages: messages,
        stream: true,
      },
      {
        signal: signal as AbortSignal,
      }
    );

    for await (const chunk of stream) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        onDelta(delta);
      }
    }
  } catch (error: any) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    
    // Extract error information from OpenAI API response
    const status = error?.status || error?.response?.status;
    const errorMessage = error?.message || error?.error?.message || String(error);
    
    // Create a more informative error
    if (status === 429) {
      throw new Error(`429: Quota exceeded - ${errorMessage}`);
    }
    
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }
}
