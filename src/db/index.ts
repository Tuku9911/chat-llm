import { openDB, type DBSchema } from "idb";
import type { Persona, ChatMessage, AppSettings } from "../types";

interface PersonaChatDB extends DBSchema {
  personas: {
    key: string;
    value: Persona;
    indexes: { "by-createdAt": number };
  };
  messages: {
    key: string;
    value: ChatMessage;
    indexes: { "by-personaId": string; "by-createdAt": number };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

export const dbPromise = openDB<PersonaChatDB>("persona-chat-db", 1, {
  upgrade(db) {
    const personaStore = db.createObjectStore("personas", { keyPath: "id" });
    personaStore.createIndex("by-createdAt", "createdAt");

    const msgStore = db.createObjectStore("messages", { keyPath: "id" });
    msgStore.createIndex("by-personaId", "personaId");
    msgStore.createIndex("by-createdAt", "createdAt");

    db.createObjectStore("settings");
  },
});

export async function getSettings(): Promise<AppSettings> {
  const db = await dbPromise;
  return (await db.get("settings", "app")) ?? { lang: "en" };
}
export async function setSettings(s: AppSettings) {
  const db = await dbPromise;
  await db.put("settings", s, "app");
}

export async function listPersonas(): Promise<Persona[]> {
  const db = await dbPromise;
  return await db.getAllFromIndex("personas", "by-createdAt");
}
export async function upsertPersona(p: Persona) {
  const db = await dbPromise;
  await db.put("personas", p);
}
export async function deletePersona(personaId: string) {
  const db = await dbPromise;
  await db.delete("personas", personaId);

  // delete messages for persona
  const tx = db.transaction("messages", "readwrite");
  const idx = tx.store.index("by-personaId");
  let cursor = await idx.openCursor(personaId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function listMessages(personaId: string): Promise<ChatMessage[]> {
  const db = await dbPromise;
  const all = await db.getAllFromIndex("messages", "by-personaId", personaId);
  return all.sort((a, b) => a.createdAt - b.createdAt);
}
export async function addMessage(m: ChatMessage) {
  const db = await dbPromise;
  await db.put("messages", m);
}
