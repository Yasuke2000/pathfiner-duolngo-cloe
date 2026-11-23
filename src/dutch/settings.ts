export type Lang = "en" | "nl";
export type Theme = "dark" | "light";
export type TrackChoice = "all" | "student" | "it" | "dev";

export interface UiSettings {
  /** Language of the interface (not of the lessons). */
  lang: Lang;
  theme: Theme;
  /** Which learning path the Learn tab shows. */
  track: TrackChoice;
}

const KEY = "dutch-ui-v1";

/** English by default: a beginner should not need Dutch to find the Dutch lessons. */
export const DEFAULT_SETTINGS: UiSettings = { lang: "en", theme: "dark", track: "all" };

export function loadSettings(): UiSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const p = JSON.parse(raw) as Partial<UiSettings>;
    return {
      lang: p.lang === "nl" ? "nl" : "en",
      theme: p.theme === "light" ? "light" : "dark",
      track: p.track === "student" || p.track === "it" || p.track === "dev" ? p.track : "all",
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
