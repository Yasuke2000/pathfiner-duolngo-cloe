import { ALL_CODE_QUESTIONS, conceptOf, type CodeQuestion } from "./code";
import { CONCEPTS, type Concept } from "./concepts";
import { dayKey, type DutchSave, type Mistake } from "./progress";
import type { ProgressMap } from "./srs";

/**
 * What the answers add up to. Everything here is derived from a save, so it
 * works the same on the learner's own progress and on a report she sent to her
 * coach.
 */

const codeKey = (q: CodeQuestion) => `code:${q.id}`;

export interface ConceptStat {
  concept: Concept;
  /** Questions that exist for this concept. */
  questions: number;
  /** Of which she has met at least once. */
  attempted: number;
  answers: number;
  correct: number;
  /** 0–100, or null if nothing was answered yet. */
  pct: number | null;
}

export function questionsFor(conceptId: string): CodeQuestion[] {
  return ALL_CODE_QUESTIONS.filter((q) => conceptOf(q) === conceptId);
}

/** Accuracy per programming concept, in the order the concepts are defined. */
export function conceptStats(progress: ProgressMap): ConceptStat[] {
  return CONCEPTS.map((concept) => {
    const qs = questionsFor(concept.id);
    let attempted = 0;
    let answers = 0;
    let correct = 0;
    for (const q of qs) {
      const st = progress[codeKey(q)];
      if (!st) continue;
      attempted += 1;
      answers += st.seen;
      correct += st.correct;
    }
    return {
      concept,
      questions: qs.length,
      attempted,
      answers,
      correct,
      pct: answers ? Math.round((correct / answers) * 100) : null,
    };
  }).filter((c) => c.questions > 0);
}

/**
 * Concepts that need attention: answered at least twice and right less than
 * 70% of the time. Worst first; among equals, the one with more evidence.
 */
export function weakConcepts(progress: ProgressMap, minAnswers = 2, below = 70): ConceptStat[] {
  return conceptStats(progress)
    .filter((c) => c.pct !== null && c.answers >= minAnswers && c.pct < below)
    .sort((a, b) => a.pct! - b.pct! || b.answers - a.answers);
}

export interface KindRow {
  kind: string;
  n: number;
  ok: number;
  pct: number;
}

/** Accuracy per exercise type, worst first — is it de/het, typing, or code? */
export function kindStats(save: DutchSave | null): KindRow[] {
  return Object.entries(save?.kinds ?? {})
    .filter(([, k]) => k.n > 0)
    .map(([kind, k]) => ({ kind, n: k.n, ok: k.ok, pct: Math.round((k.ok / k.n) * 100) }))
    .sort((a, b) => a.pct - b.pct || b.n - a.n);
}

/** The latest mistakes, newest first. */
export function recentMistakes(save: DutchSave | null, limit = 50): Mistake[] {
  return [...(save?.log ?? [])].sort((a, b) => b.t - a.t).slice(0, limit);
}

export interface MissedQuestion {
  question: CodeQuestion;
  concept: Concept | undefined;
  seen: number;
  wrong: number;
  /** Her most recent wrong answer, if it is still in the log. */
  lastGiven: string | null;
}

/** Code questions she got wrong at least once, most-missed first. */
export function missedQuestions(save: DutchSave | null): MissedQuestion[] {
  if (!save) return [];
  const lastWrong = new Map<string, string>();
  for (const m of save.log ?? []) lastWrong.set(m.id, m.given); // log is oldest-first
  const out: MissedQuestion[] = [];
  for (const q of ALL_CODE_QUESTIONS) {
    const st = save.terms[codeKey(q)];
    if (!st || st.seen === st.correct) continue;
    out.push({
      question: q,
      concept: CONCEPTS.find((c) => c.id === conceptOf(q)),
      seen: st.seen,
      wrong: st.seen - st.correct,
      lastGiven: lastWrong.has(codeKey(q)) ? lastWrong.get(codeKey(q))! : null,
    });
  }
  return out.sort((a, b) => b.wrong - a.wrong || b.seen - a.seen);
}

export interface Summary {
  answers: number;
  correct: number;
  pct: number | null;
  /** Days with any practice in the last 14. */
  activeDays14: number;
  /** YYYY-MM-DD of the last practice, or null. */
  lastActive: string | null;
  /** Whole days since the last practice, or null. */
  daysSince: number | null;
}

export function summarise(save: DutchSave | null, now: number): Summary {
  let answers = 0;
  let correct = 0;
  for (const st of Object.values(save?.terms ?? {})) {
    answers += st.seen;
    correct += st.correct;
  }
  const days = Object.keys(save?.history ?? {}).filter((d) => (save!.history![d].n ?? 0) > 0).sort();
  const lastActive = days.length ? days[days.length - 1] : null;

  let activeDays14 = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (save?.history?.[dayKey(d.getTime())]?.n) activeDays14 += 1;
  }

  let daysSince: number | null = null;
  if (lastActive) {
    const last = new Date(`${lastActive}T12:00:00`).getTime();
    const today = new Date(`${dayKey(now)}T12:00:00`).getTime();
    daysSince = Math.max(0, Math.round((today - last) / 86_400_000));
  }

  return {
    answers,
    correct,
    pct: answers ? Math.round((correct / answers) * 100) : null,
    activeDays14,
    lastActive,
    daysSince,
  };
}
