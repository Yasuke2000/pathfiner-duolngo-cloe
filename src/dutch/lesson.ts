import type { CodeQuestion } from "./code";
import { acceptedAnswers } from "./grade";
import type { ProgressMap } from "./srs";
import { isDue } from "./srs";
import { articleOf, bareNoun, termId, type Dir, type Term } from "./types";

export interface PoolItem {
  unitId: string;
  term: Term;
}

interface Base {
  id: string;
  unitId: string;
}

interface WordBase extends Base {
  term: Term;
}

export type Exercise =
  | (WordBase & { kind: "choose"; dir: Dir; prompt: string; options: string[]; answer: string })
  | (WordBase & { kind: "type"; dir: Dir; prompt: string; accepted: string[] })
  | (WordBase & { kind: "article"; noun: string; answer: "de" | "het" })
  | (WordBase & { kind: "listen"; spoken: string; accepted: string[] })
  | (WordBase & { kind: "build"; prompt: string; words: string[]; answer: string })
  | (Base & { kind: "code"; q: CodeQuestion; options: string[] });

/** The vocabulary term an exercise drills, when it drills one at all. */
export function termOf(ex: Exercise): Term | undefined {
  return "term" in ex ? ex.term : undefined;
}

/** Small deterministic RNG so lessons are reproducible in tests. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Primary display string for a term in one direction. */
function face(term: Term, dir: Dir): string {
  return dir === "nl>en" ? term.en : term.nl;
}

function distractors(target: Term, pool: PoolItem[], dir: Dir, rand: () => number): string[] {
  const want = face(target, dir);
  const others = pool
    .map((p) => p.term)
    .filter((t) => t !== target && face(t, dir) !== want);
  return shuffle(others, rand).slice(0, 3).map((t) => face(t, dir));
}

export interface LessonOptions {
  size?: number;
  seed?: number;
  progress?: ProgressMap;
  now?: number;
  /** Include listening exercises (browser speech synthesis available). */
  audio?: boolean;
}

/**
 * Pick which terms to drill: anything never seen, then anything due for review,
 * then — only to fill the lesson out — terms that are resting.
 */
export function selectTerms(pool: PoolItem[], opts: LessonOptions = {}): PoolItem[] {
  const { size = 12, progress = {}, now = Date.now(), seed = 1 } = opts;
  const rand = rng(seed);
  const fresh: PoolItem[] = [];
  const due: PoolItem[] = [];
  const resting: PoolItem[] = [];
  for (const item of pool) {
    const st = progress[termId(item.unitId, item.term.nl)];
    if (!st) fresh.push(item);
    else if (isDue(st, now)) due.push(item);
    else resting.push(item);
  }
  const ordered = [...shuffle(due, rand), ...shuffle(fresh, rand), ...shuffle(resting, rand)];
  return ordered.slice(0, Math.min(size, pool.length));
}

function makeExercise(
  item: PoolItem,
  pool: PoolItem[],
  isNew: boolean,
  rand: () => number,
  audio: boolean,
): Exercise {
  const { unitId, term } = item;
  const id = termId(unitId, term.nl);
  const base = { id, unitId, term };
  const noun = term.kind === "sentence" ? null : articleOf(term.nl);
  const isSentence = term.kind === "sentence";

  // A brand-new word is shown as recognition first — never ask someone to
  // produce a word they have not met.
  if (isNew) {
    const dir: Dir = "nl>en";
    const answer = face(term, dir);
    return {
      ...base,
      kind: "choose",
      dir,
      prompt: term.nl,
      answer,
      options: shuffle([answer, ...distractors(term, pool, dir, rand)], rand),
    };
  }

  // A sentence is practised by assembling it or typing it, never by article.
  const kinds: Exercise["kind"][] = isSentence
    ? ["build", "build", "type", "choose"]
    : ["type", "type", "choose"];
  if (noun) kinds.push("article");
  if (audio) kinds.push("listen");
  if (!isSentence && term.example) kinds.push("build");
  const kind = kinds[Math.floor(rand() * kinds.length)];

  if (kind === "article" && noun) {
    return { ...base, kind: "article", noun: bareNoun(term.nl), answer: noun };
  }
  if (kind === "listen") {
    return { ...base, kind: "listen", spoken: term.nl, accepted: acceptedAnswers(term, "en>nl") };
  }
  if (kind === "build") {
    // For a sentence the sentence itself is the target; for a word we use its
    // example sentence.
    const target = isSentence ? { nl: term.nl, en: term.en } : term.example;
    if (target) {
      const words = target.nl.replace(/\s+/g, " ").trim().split(" ");
      return {
        ...base,
        kind: "build",
        prompt: target.en,
        words: shuffle(words, rand),
        answer: target.nl,
      };
    }
  }
  if (kind === "choose") {
    const dir: Dir = rand() < 0.5 ? "nl>en" : "en>nl";
    const answer = face(term, dir);
    return {
      ...base,
      kind: "choose",
      dir,
      prompt: dir === "nl>en" ? term.nl : term.en,
      answer,
      options: shuffle([answer, ...distractors(term, pool, dir, rand)], rand),
    };
  }
  // Typing, weighted towards production (English -> Dutch), which is the hard way.
  const dir: Dir = rand() < 0.6 ? "en>nl" : "nl>en";
  return {
    ...base,
    kind: "type",
    dir,
    prompt: dir === "en>nl" ? term.en : term.nl,
    accepted: acceptedAnswers(term, dir),
  };
}

export function buildLesson(pool: PoolItem[], opts: LessonOptions = {}): Exercise[] {
  const { seed = 1, progress = {}, audio = false } = opts;
  const rand = rng(seed + 7);
  const chosen = selectTerms(pool, opts);
  return chosen.map((item) =>
    makeExercise(item, pool, !progress[termId(item.unitId, item.term.nl)], rand, audio),
  );
}

/** The answer string an exercise is checking against, for display when wrong. */
export function expectedOf(ex: Exercise): string {
  switch (ex.kind) {
    case "choose":
      return ex.answer;
    case "type":
      return ex.accepted[0];
    case "article":
      return `${ex.answer} ${ex.noun}`;
    case "listen":
      return ex.accepted[0];
    case "build":
      return ex.answer;
    case "code":
      return ex.q.answer;
  }
}

/**
 * A lesson of code-reading questions. Unseen questions come first, then the
 * ones due for review — the same spacing as the vocabulary.
 */
export function buildCodeLesson(
  questions: CodeQuestion[],
  opts: LessonOptions = {},
): Exercise[] {
  const { size = 8, seed = 1, progress = {}, now = Date.now() } = opts;
  const rand = rng(seed + 11);
  const fresh = questions.filter((q) => !progress[codeId(q)]);
  const due = questions.filter((q) => progress[codeId(q)] && isDue(progress[codeId(q)], now));
  const resting = questions.filter(
    (q) => progress[codeId(q)] && !isDue(progress[codeId(q)], now),
  );
  const ordered = [...shuffle(fresh, rand), ...shuffle(due, rand), ...shuffle(resting, rand)];
  return ordered.slice(0, Math.min(size, questions.length)).map((q) => ({
    id: codeId(q),
    unitId: "code",
    kind: "code" as const,
    q,
    options: shuffle(q.options, rand),
  }));
}

export function codeId(q: CodeQuestion): string {
  return `code:${q.id}`;
}
