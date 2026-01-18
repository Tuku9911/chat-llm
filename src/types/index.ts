export type Gender = "male" | "female" | "other";

export type Persona = {
  id: string;
  name: string;
  birthdate: string;     // "YYYY-MM-DD"
  livedPlace: string;
  details: string;
  gender: Gender;
  createdAt: number;
};

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  personaId: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type AppSettings = {
  lang: "en" | "ja";
  selectedPersonaId?: string;
  openaiApiKey?: string;
  workerUrl?: string; // Cloudflare Worker URL
};
