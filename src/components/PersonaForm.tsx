import { useState, useEffect } from "react";
import type { Persona, Gender } from "../types";

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "male" },
  { value: "female", label: "female" },
  { value: "other", label: "other" },
];

interface PersonaFormProps {
  persona: Persona;
  onSave: (p: Persona) => void;
  translations: {
    name: string;
    birthdate: string;
    livedPlace: string;
    details: string;
    gender: string;
    save: string;
  };
}

export function PersonaForm({ persona, onSave, translations }: PersonaFormProps) {
  const [editedPersona, setEditedPersona] = useState<Persona>(persona);

  useEffect(() => {
    setEditedPersona(persona);
  }, [persona]);

  function updateField<K extends keyof Persona>(field: K, value: Persona[K]) {
    setEditedPersona(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave(editedPersona);
  }

  return (
    <div className="persona-form">
      <div className="form-group">
        <label className="form-label">{translations.name}</label>
        <input
          className="form-input"
          value={editedPersona.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder={translations.name}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{translations.birthdate}</label>
        <input
          className="form-input"
          type="date"
          value={editedPersona.birthdate}
          onChange={(e) => updateField("birthdate", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{translations.livedPlace}</label>
        <input
          className="form-input"
          value={editedPersona.livedPlace}
          onChange={(e) => updateField("livedPlace", e.target.value)}
          placeholder={translations.livedPlace}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{translations.gender}</label>
        <select
          className="form-select"
          value={editedPersona.gender}
          onChange={(e) => updateField("gender", e.target.value as Gender)}
        >
          {genderOptions.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{translations.details}</label>
        <textarea
          className="form-textarea"
          value={editedPersona.details}
          onChange={(e) => updateField("details", e.target.value)}
          placeholder={translations.details}
        />
      </div>

      <button className="save-btn" onClick={handleSave}>
        {translations.save}
      </button>
    </div>
  );
}
