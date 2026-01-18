import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  streaming: boolean;
  translations: {
    messagePlaceholder: string;
    send: string;
  };
}

export function ChatInput({ onSend, streaming, translations }: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSendTimeRef = useRef<number>(0);
  const RATE_LIMIT_MS = 1000; // Minimum 1 second between sends

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Auto-focus input when streaming ends
  useEffect(() => {
    if (!streaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [streaming]);

  function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;

    // Rate limiting: prevent spam clicking
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTimeRef.current;
    if (timeSinceLastSend < RATE_LIMIT_MS) {
      console.warn(`Rate limited: Please wait ${Math.ceil((RATE_LIMIT_MS - timeSinceLastSend) / 1000)}s`);
      return;
    }

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Debounce: wait 300ms before actually sending
    debounceRef.current = setTimeout(() => {
      lastSendTimeRef.current = Date.now();
      onSend(text);
      setInput("");
      debounceRef.current = null;
      
      // Auto-focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }, 300);
  }

  return (
    <div className="chat-input-container">
      <input
        ref={inputRef}
        className="chat-input"
        value={input}
        placeholder={translations.messagePlaceholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={streaming}
      />
      <button className="send-btn" onClick={handleSend} disabled={streaming || !input.trim()}>
        {streaming ? "..." : translations.send}
      </button>
    </div>
  );
}
