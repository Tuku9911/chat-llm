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
  if (!persona) {
    return <div className="empty-state">{translations.selectPersona}</div>;
  }

  return (
    <div className="chat-window">
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
