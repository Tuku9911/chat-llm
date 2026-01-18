import { useEffect, useMemo, useState } from "react";
import { t } from "./i18n";
import { usePersonas } from "./hooks/usePersonas";
import { useSettings } from "./hooks/useSettings";
import { useChat } from "./hooks/useChat";
import { PersonaList } from "./components/PersonaList";
import { PersonaForm } from "./components/PersonaForm";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { validateOpenAIKey } from "./utils/apiKeyValidator";

export default function App() {
  const { settings, setLang, updateSettings } = useSettings();
  const L = t[settings.lang];

  const { personas, createPersona, savePersona, removePersona } = usePersonas();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | undefined>(
    settings.selectedPersonaId
  );
  const [useOpenAI, setUseOpenAI] = useState(!!settings.openaiApiKey);

  const selectedPersona = useMemo(
    () => personas.find(p => p.id === selectedPersonaId),
    [personas, selectedPersonaId]
  );

  const { messages, streaming, loadMessages, clearMessages, sendMessage, abortStreaming } =
    useChat(selectedPersona, {
      apiKey: settings.openaiApiKey,
      workerUrl: settings.workerUrl,
      useOpenAI: useOpenAI && (!!settings.openaiApiKey || !!settings.workerUrl),
      onQuotaError: () => {
        // Automatically disable OpenAI when quota error occurs
        setUseOpenAI(false);
      },
    });

  useEffect(() => {
    async function initializeSelection() {
      // If settings has selected persona, use it
      if (settings.selectedPersonaId) {
        const personaExists = personas.find(p => p.id === settings.selectedPersonaId);
        if (personaExists) {
          setSelectedPersonaId(settings.selectedPersonaId);
          await loadMessages(settings.selectedPersonaId);
          return;
        }
      }
      
      // Otherwise, select first persona (should be default Elon Musk)
      if (personas.length > 0 && !selectedPersonaId) {
        const firstPersona = personas[0];
        setSelectedPersonaId(firstPersona.id);
        await loadMessages(firstPersona.id);
        await updateSettings({ selectedPersonaId: firstPersona.id });
      }
    }
    
    if (personas.length > 0) {
      initializeSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personas]);

  useEffect(() => {
    updateSettings({ selectedPersonaId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPersonaId]);

  async function handleCreatePersona() {
    const p = await createPersona();
    setSelectedPersonaId(p.id);
    clearMessages();
  }

  async function handleDeletePersona(id: string) {
    abortStreaming();
    await removePersona(id);
    if (selectedPersonaId === id) {
      setSelectedPersonaId(undefined);
      clearMessages();
    }
  }

  async function handleSelectPersona(id: string) {
    abortStreaming();
    setSelectedPersonaId(id);
    await loadMessages(id);
  }

  async function handleSendMessage(text: string) {
    await sendMessage(text);
  }

  async function handleSetLang(lang: "en" | "ja") {
    await setLang(lang);
  }

  async function handleApiKeyChange(key: string) {
    const trimmed = key.trim();
    
    // Validate API key format if provided
    if (trimmed) {
      const validation = validateOpenAIKey(trimmed);
      if (!validation.valid) {
        // Show error but still allow saving (user might be in the middle of typing)
        console.warn("API Key validation:", validation.error);
        // You could add a visual error indicator here
      }
    }
    
    await updateSettings({ openaiApiKey: trimmed || undefined });
    if (!trimmed && !settings.workerUrl) {
      setUseOpenAI(false);
    } else {
      // Auto-enable OpenAI if valid key is provided
      const validation = validateOpenAIKey(trimmed);
      if (validation.valid && !useOpenAI) {
        setUseOpenAI(true);
      }
    }
  }

  async function handleWorkerUrlChange(url: string) {
    const trimmed = url.trim();
    await updateSettings({ workerUrl: trimmed || undefined });
    if (!trimmed && !settings.openaiApiKey) {
      setUseOpenAI(false);
    } else if (trimmed && !useOpenAI) {
      setUseOpenAI(true);
    }
  }

  function handleToggleOpenAI() {
    if (useOpenAI && !settings.openaiApiKey && !settings.workerUrl) return;
    setUseOpenAI(!useOpenAI);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">{L.title}</h1>
        <div className="header-controls">
          {/* Worker URL Input (Preferred) */}
          <div className="control-group">
            <label style={{ fontSize: "12px", fontWeight: 600 }}>{L.workerUrl}:</label>
            <input
              type="text"
              className="form-input"
              placeholder={L.workerUrlPlaceholder}
              value={settings.workerUrl || ""}
              onChange={(e) => handleWorkerUrlChange(e.target.value)}
              style={{ width: "250px", fontSize: "12px" }}
            />
          </div>

          {/* API Key Input (Fallback) */}
          <div className="control-group">
            <label style={{ fontSize: "12px", fontWeight: 600 }}>{L.apiKey}:</label>
            <input
              type="password"
              className="api-key-input form-input"
              placeholder={L.apiKeyPlaceholder}
              value={settings.openaiApiKey || ""}
              onChange={(e) => handleApiKeyChange(e.target.value)}
            />
          </div>
          
          {/* OpenAI Toggle */}
          <div className="control-group">
            <label style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "13px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={useOpenAI}
                onChange={handleToggleOpenAI}
                disabled={!settings.openaiApiKey && !settings.workerUrl}
                style={{ cursor: "pointer" }}
              />
              <span>{useOpenAI ? L.useOpenAI : L.useMock}</span>
            </label>
          </div>

          {/* Language Selector */}
          <div className="control-group">
            <span style={{ fontSize: "13px", fontWeight: 600 }}>{L.lang}:</span>
            <select 
              className="form-select"
              value={settings.lang} 
              onChange={(e) => handleSetLang(e.target.value as "en" | "ja")}
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </header>
      
      {(settings.openaiApiKey || settings.workerUrl) && (
        <p className="api-key-hint">
          {settings.workerUrl ? L.workerUrlHint : L.apiKeyHint}
        </p>
      )}

      <div className="main-grid">
        {/* Left: Persona list + editor */}
        <section className="sidebar-section">
          <PersonaList
            personas={personas}
            selectedPersonaId={selectedPersonaId}
            onCreatePersona={handleCreatePersona}
            onSelectPersona={handleSelectPersona}
            onDeletePersona={handleDeletePersona}
            translations={{
              personas: L.personas,
              createPersona: L.createPersona,
              delete: L.delete,
              clearHint: L.clearHint,
            }}
          />

          {selectedPersona && (
            <PersonaForm
              persona={selectedPersona}
              onSave={savePersona}
              translations={{
                name: L.name,
                birthdate: L.birthdate,
                livedPlace: L.livedPlace,
                details: L.details,
                gender: L.gender,
                save: L.save,
              }}
            />
          )}
        </section>

        {/* Right: Chat */}
        <section className="chat-section">
          <div className="chat-header">{L.chat}</div>
          <ChatWindow
            messages={messages}
            streaming={streaming}
            persona={selectedPersona}
            translations={{
              selectPersona: L.selectPersona,
              streaming: L.streaming,
            }}
          />
          {selectedPersona && (
            <ChatInput
              onSend={handleSendMessage}
              streaming={streaming}
              translations={{
                messagePlaceholder: L.messagePlaceholder,
                send: L.send,
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}
