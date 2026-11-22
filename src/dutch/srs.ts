/**
 * Leitner-box spaced repetition.
 *
 * This is the opposite philosophy from the Pathfinder course on purpose: that
 * one you play once and graduate. Vocabulary only sticks if it comes back, so
 * here a term you get right keeps widening its interval, and a term you miss
 * drops straight back to the front of the queue.
 */
export const MAX_BOX = 5;

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** How long a term rests after reaching each box. */
export const INTERVALS: number[] = [0, 10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY];

export interface TermState {
  box: number;
  /** Timestamp (ms) when this term should be asked again. */
  due: number;
  seen: number;
  correct: number;
}

export type ProgressMap = Record<string, TermState>;

export function review(state: TermState | undefined, correct: boolean, now: number): TermState {
  const prev: TermState = state ?? { box: 0, due: 0, seen: 0, correct: 0 };
  const box = correct ? Math.min(MAX_BOX, prev.box + 1) : 1;
  return {
    box,
    due: now + INTERVALS[box],
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
  };
}

export function isDue(state: TermState | undefined, now: number): boolean {
  if (!state) return true; // never seen — always worth asking
  return state.due <= now;
}

/** A term is "known" once it has survived to the long intervals. */
export function isMastered(state: TermState | undefined): boolean {
  return !!state && state.box >= 4;
}

export function masteredCount(ids: string[], progress: ProgressMap): number {
  return ids.filter((id) => isMastered(progress[id])).length;
}

/** 0..1 — how far a set of terms has moved up the boxes. */
export function strength(ids: string[], progress: ProgressMap): number {
  if (!ids.length) return 0;
  const total = ids.reduce((sum, id) => sum + Math.min(MAX_BOX, progress[id]?.box ?? 0), 0);
  return total / (ids.length * MAX_BOX);
}

export function dueIds(ids: string[], progress: ProgressMap, now: number): string[] {
  return ids.filter((id) => progress[id] && isDue(progress[id], now));
}
