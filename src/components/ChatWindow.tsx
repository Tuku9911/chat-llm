import { useEffect, useRef } from "react";
import type { ChatMessage, Persona } from "../types";

interface ChatWindowProps {
  messages: ChatMessage[];
  streaming: boolean;
  persona: Persona | undefined;
  translations: {
    selectPersona: string;
    streaming: string;
  };
}

export function ChatWindow({ messages, streaming, persona, translations }: ChatWindowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or streaming
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  if (!persona) {
    return <div className="empty-state">{translations.selectPersona}</div>;
  }

  return (
    <div className="chat-window" ref={scrollContainerRef}>
      {messages.map(m => (
        <div
          key={m.id}
          className={`chat-message ${m.role}`}
        >
          <div className="message-author">
            {m.role === "user" ? "You" : persona.name || "Persona"}
          </div>
          <div className="message-content">
            {m.content || (m.role === "assistant" && streaming ? (
              <>
                {translations.streaming}
                <span className="streaming-indicator"></span>
              </>
            ) : "")}
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="empty-state">
          Start chatting with {persona.name || "this persona"}...
        </div>
      )}
    </div>
  );
}
