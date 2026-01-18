import { useState, useEffect } from "react";
import type { Persona } from "../types";
import { listPersonas, upsertPersona, deletePersona } from "../db";
import { uid } from "../utils/uid";

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);

  async function refreshPersonas() {
    const ps = await listPersonas();
    setPersonas(ps);
  }

  useEffect(() => {
    async function initializePersonas() {
      const ps = await listPersonas();
      
      // Create default "Elon Musk" persona if no personas exist
      if (ps.length === 0) {
        const defaultPersona: Persona = {
          id: "default-elon-musk",
          name: "Elon Musk",
          birthdate: "1971-06-28",
          livedPlace: "USA",
          details: "CEO of Tesla and SpaceX. Known for innovation, first principles thinking, and ambitious goals.",
          gender: "male",
          createdAt: Date.now(),
        };
        await upsertPersona(defaultPersona);
        await refreshPersonas();
      } else {
        setPersonas(ps);
      }
    }
    
    initializePersonas();
  }, []);

  async function createPersona(): Promise<Persona> {
    const now = Date.now();
    const p: Persona = {
      id: uid(),
      name: "",
      birthdate: "",
      livedPlace: "",
      details: "",
      gender: "other",
      createdAt: now,
    };
    await upsertPersona(p);
    await refreshPersonas();
    return p;
  }

  async function savePersona(p: Persona) {
    await upsertPersona(p);
    await refreshPersonas();
  }

  async function removePersona(id: string) {
    await deletePersona(id);
    await refreshPersonas();
  }

  return {
    personas,
    createPersona,
    savePersona,
    removePersona,
    refreshPersonas,
  };
}
