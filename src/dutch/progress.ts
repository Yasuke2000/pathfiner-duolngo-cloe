import type { ProgressMap, TermState } from "./srs";
import { review } from "./srs";

const KEY = "dutch-progress-v1";

/** XP per day that counts as "done for today" — roughly one lesson. */
export const DAILY_GOAL = 100;

export interface DutchSave {
  terms: ProgressMap;
  xp: number;
  lessons: number;
  /** XP earned on `day` (local date, YYYY-MM-DD). */
  day?: string;
  dayXp?: number;
  /** Consecutive days on which the daily goal was reached. */
  streak?: number;
  /** Last day the goal was reached. */
  goalDay?: string;
}

const empty = (): DutchSave => ({ terms: {}, xp: 0, lessons: 0 });

export function dayKey(now: number): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function previousDay(now: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return dayKey(d.getTime());
}

export function loadProgress(): DutchSave {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<DutchSave>;
    return { ...parsed, terms: parsed.terms ?? {}, xp: parsed.xp ?? 0, lessons: parsed.lessons ?? 0 };
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
  const gained = correct ? 10 : 2; // getting it wrong still teaches you something
  const today = dayKey(now);
  const before = save.day === today ? (save.dayXp ?? 0) : 0;
  const after = before + gained;

  let { streak = 0, goalDay } = save;
  if (before < DAILY_GOAL && after >= DAILY_GOAL && goalDay !== today) {
    streak = goalDay === previousDay(now) ? streak + 1 : 1;
    goalDay = today;
  }

  return {
    ...save,
    terms: { ...save.terms, [id]: next },
    xp: save.xp + gained,
    day: today,
    dayXp: after,
    streak,
    goalDay,
  };
}

/** XP earned today (zero if the save is from an earlier day). */
export function todayXp(save: DutchSave | null, now = Date.now()): number {
  if (!save || save.day !== dayKey(now)) return 0;
  return save.dayXp ?? 0;
}

/** The streak as it stands now: it lapses if yesterday's goal was missed. */
export function currentStreak(save: DutchSave | null, now = Date.now()): number {
  if (!save?.goalDay || !save.streak) return 0;
  return save.goalDay === dayKey(now) || save.goalDay === previousDay(now) ? save.streak : 0;
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
