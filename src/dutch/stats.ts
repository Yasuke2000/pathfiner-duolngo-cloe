import type { PoolItem } from "./lesson";
import { dayKey, type DutchSave } from "./progress";
import type { ProgressMap } from "./srs";
import { termId } from "./types";

/** Aggregations behind the progress tab. Pure, so they can be tested. */

export interface ActivityDay {
  day: string;
  /** Day of the month, for the axis. */
  label: string;
  xp: number;
  n: number;
  ok: number;
  isToday: boolean;
}

/** The last `days` days, oldest first, with zeroes for days without practice. */
export function activitySeries(save: DutchSave | null, now: number, days = 14): ActivityDay[] {
  const out: ActivityDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d.getTime());
    const stat = save?.history?.[key];
    out.push({
      day: key,
      label: String(d.getDate()),
      xp: stat?.xp ?? 0,
      n: stat?.n ?? 0,
      ok: stat?.ok ?? 0,
      isToday: i === 0,
    });
  }
  return out;
}

export interface Accuracy {
  answers: number;
  correct: number;
  /** 0–100, or null before the first answer. */
  pct: number | null;
}

export function accuracy(progress: ProgressMap): Accuracy {
  let answers = 0;
  let correct = 0;
  for (const st of Object.values(progress)) {
    answers += st.seen;
    correct += st.correct;
  }
  return { answers, correct, pct: answers ? Math.round((correct / answers) * 100) : null };
}

export interface Strength {
  unseen: number;
  /** Boxes 1–2: just met, coming back soon. */
  learning: number;
  /** Box 3: sticking. */
  almost: number;
  /** Boxes 4–5: on the long intervals. */
  known: number;
}

export function strengthBuckets(ids: string[], progress: ProgressMap): Strength {
  const out: Strength = { unseen: 0, learning: 0, almost: 0, known: 0 };
  for (const id of ids) {
    const box = progress[id]?.box ?? 0;
    if (!progress[id]) out.unseen += 1;
    else if (box <= 2) out.learning += 1;
    else if (box === 3) out.almost += 1;
    else out.known += 1;
  }
  return out;
}

export interface WeakItem extends PoolItem {
  seen: number;
  correct: number;
  ratio: number;
}

/**
 * The words that keep going wrong: answered at least twice, right less than 80%
 * of the time. Worst first; among equals, the one tried most often.
 */
export function weakest(pool: PoolItem[], progress: ProgressMap, limit = 10): WeakItem[] {
  const out: WeakItem[] = [];
  for (const item of pool) {
    const st = progress[termId(item.unitId, item.term.nl)];
    if (!st || st.seen < 2) continue;
    const ratio = st.correct / st.seen;
    if (ratio < 0.8) out.push({ ...item, seen: st.seen, correct: st.correct, ratio });
  }
  out.sort((a, b) => a.ratio - b.ratio || b.seen - a.seen);
  return out.slice(0, limit);
}
