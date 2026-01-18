import { useState, useEffect } from "react";
import type { AppSettings } from "../types";
import { getSettings, setSettings } from "../db";

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>({ lang: "en" });

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setSettingsState(s);
    })();
  }, []);

  async function updateSettings(updates: Partial<AppSettings>) {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    await setSettings(newSettings);
  }

  async function setLang(lang: "en" | "ja") {
    await updateSettings({ lang });
  }

  return {
    settings,
    setLang,
    updateSettings,
  };
}
