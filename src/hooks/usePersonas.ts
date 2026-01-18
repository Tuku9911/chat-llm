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
    refreshPersonas();
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
