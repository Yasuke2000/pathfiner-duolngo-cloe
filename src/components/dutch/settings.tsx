"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Lang, type Theme, type TrackChoice, type UiSettings } from "@/dutch/settings";
import { translate, type UiKey } from "@/dutch/ui";

interface Ctx extends UiSettings {
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  setTrack: (track: TrackChoice) => void;
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Pick the Dutch or the English name of something, following the interface language. */
  pick: (nl: string, en: string) => string;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UiSettings>(DEFAULT_SETTINGS);

  // Read after mount so the server-rendered HTML and the first client render agree.
  useEffect(() => setSettings(loadSettings()), []);

  const update = useCallback((patch: Partial<UiSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...settings,
      setLang: (lang) => update({ lang }),
      setTheme: (theme) => update({ theme }),
      setTrack: (track) => update({ track }),
      t: (key, vars) => translate(settings.lang, key, vars),
      pick: (nl, en) => (settings.lang === "nl" ? nl : en),
    }),
    [settings, update],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useUi(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useUi must be used inside <SettingsProvider>");
  return ctx;
}
