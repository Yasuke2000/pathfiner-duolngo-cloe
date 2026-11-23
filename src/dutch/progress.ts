import type { ProgressMap, TermState } from "./srs";
import { review } from "./srs";

export const SAVE_KEY = "dutch-progress-v1";

/** XP per day that counts as "done for today" — roughly one lesson. */
export const DAILY_GOAL = 100;

/** How many days of activity history to keep. */
const HISTORY_DAYS = 180;

export interface DayStat {
  xp: number;
  /** Answers given. */
  n: number;
  /** Of which correct. */
  ok: number;
}

/** One wrong answer, kept so the learner's coach can see what actually went wrong. */
export interface Mistake {
  /** When (ms since epoch). */
  t: number;
  /** Term or code-question id. */
  id: string;
  /** Exercise type: choose, type, article, listen, build, code. */
  kind: string;
  /** What was asked. */
  asked: string;
  /** What she answered — empty when she chose "I don't know". */
  given: string;
  expected: string;
}

export interface KindStat {
  n: number;
  ok: number;
}

/** Detail about the answer being recorded. */
export interface AnswerDetail {
  kind: string;
  asked: string;
  given: string;
  expected: string;
}

/** How many mistakes to remember. */
export const LOG_LIMIT = 400;

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
  /** Per-day activity, newest ~180 days. Drives the progress charts. */
  history?: Record<string, DayStat>;
  /** The most recent mistakes, oldest first. */
  log?: Mistake[];
  /** Tallies per exercise type — is it de/het, typing or code that goes wrong? */
  kinds?: Record<string, KindStat>;
}

export const emptySave = (): DutchSave => ({ terms: {}, xp: 0, lessons: 0 });

export function dayKey(now: number): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function previousDay(now: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return dayKey(d.getTime());
}

export function loadProgress(): DutchSave {
  if (typeof window === "undefined") return emptySave();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw) as Partial<DutchSave>;
    return { ...parsed, terms: parsed.terms ?? {}, xp: parsed.xp ?? 0, lessons: parsed.lessons ?? 0 };
  } catch {
    return emptySave();
  }
}

export function saveProgress(save: DutchSave): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Private mode / blocked storage: practising still works, it just won't persist.
  }
}

function pruneHistory(history: Record<string, DayStat>): Record<string, DayStat> {
  const keys = Object.keys(history).sort();
  if (keys.length <= HISTORY_DAYS) return history;
  const keep = keys.slice(-HISTORY_DAYS);
  return Object.fromEntries(keep.map((k) => [k, history[k]]));
}

export function recordAnswer(
  save: DutchSave,
  id: string,
  correct: boolean,
  now = Date.now(),
  detail?: AnswerDetail,
): DutchSave {
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

  const prevDay = save.history?.[today] ?? { xp: 0, n: 0, ok: 0 };
  const history = pruneHistory({
    ...(save.history ?? {}),
    [today]: { xp: prevDay.xp + gained, n: prevDay.n + 1, ok: prevDay.ok + (correct ? 1 : 0) },
  });

  let { log, kinds } = save;
  if (detail) {
    const k = kinds?.[detail.kind] ?? { n: 0, ok: 0 };
    kinds = { ...(kinds ?? {}), [detail.kind]: { n: k.n + 1, ok: k.ok + (correct ? 1 : 0) } };
    if (!correct) {
      log = [...(log ?? []), { t: now, id, ...detail }].slice(-LOG_LIMIT);
    }
  }

  return {
    ...save,
    terms: { ...save.terms, [id]: next },
    xp: save.xp + gained,
    day: today,
    dayXp: after,
    streak,
    goalDay,
    history,
    log,
    kinds,
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
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
