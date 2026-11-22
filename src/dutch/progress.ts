import type { ProgressMap, TermState } from "./srs";
import { review } from "./srs";

const KEY = "dutch-progress-v1";

export interface DutchSave {
  terms: ProgressMap;
  xp: number;
  lessons: number;
}

const empty = (): DutchSave => ({ terms: {}, xp: 0, lessons: 0 });

export function loadProgress(): DutchSave {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<DutchSave>;
    return {
      terms: parsed.terms ?? {},
      xp: parsed.xp ?? 0,
      lessons: parsed.lessons ?? 0,
    };
  } catch {
    return empty();
  }
}

export function saveProgress(save: DutchSave): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Private mode / blocked storage: practising still works, it just won't persist.
  }
}

export function recordAnswer(save: DutchSave, id: string, correct: boolean, now = Date.now()): DutchSave {
  const next: TermState = review(save.terms[id], correct, now);
  return {
    ...save,
    terms: { ...save.terms, [id]: next },
    xp: save.xp + (correct ? 10 : 2), // getting it wrong still teaches you something
  };
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
