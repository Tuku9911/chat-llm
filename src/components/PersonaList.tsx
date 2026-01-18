import type { Persona } from "../types";

interface PersonaListProps {
  personas: Persona[];
  selectedPersonaId?: string;
  onCreatePersona: () => void;
  onSelectPersona: (id: string) => void;
  onDeletePersona: (id: string) => void;
  translations: {
    personas: string;
    createPersona: string;
    delete: string;
    clearHint: string;
  };
}

export function PersonaList({
  personas,
  selectedPersonaId,
  onCreatePersona,
  onSelectPersona,
  onDeletePersona,
  translations,
}: PersonaListProps) {
  return (
    <>
      <div className="persona-list-header">
        <h3 className="persona-list-title">{translations.personas}</h3>
        <button className="create-persona-btn" onClick={onCreatePersona}>
          {translations.createPersona}
        </button>
      </div>

      <p className="persona-hint">{translations.clearHint}</p>

      <div>
        {personas.map(p => (
          <div
            key={p.id}
            className={`persona-item ${p.id === selectedPersonaId ? "selected" : ""}`}
          >
            <button className="persona-item-name" onClick={() => onSelectPersona(p.id)}>
              {p.name || "(untitled)"}
            </button>
            <button className="delete-btn danger" onClick={() => onDeletePersona(p.id)}>
              {translations.delete}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
