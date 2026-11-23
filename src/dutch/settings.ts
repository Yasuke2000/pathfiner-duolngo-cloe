export type Lang = "en" | "nl";
export type Theme = "dark" | "light";

export interface UiSettings {
  /** Language of the interface (not of the lessons). */
  lang: Lang;
  theme: Theme;
}

const KEY = "dutch-ui-v1";

/** English by default: a beginner should not need Dutch to find the Dutch lessons. */
export const DEFAULT_SETTINGS: UiSettings = { lang: "en", theme: "dark" };

export function loadSettings(): UiSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const p = JSON.parse(raw) as Partial<UiSettings>;
    return {
      lang: p.lang === "nl" ? "nl" : "en",
      theme: p.theme === "light" ? "light" : "dark",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UiSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
