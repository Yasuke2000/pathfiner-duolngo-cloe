import type { Dir, Term } from "./types";

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.,!?;:'"`´’()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Drop a leading article/infinitive marker so "bestand" matches "het bestand". */
export function stripLead(s: string): string {
  return s.replace(/^(de|het|een|the|a|an|to)\s+/, "").trim();
}

/** Classic Levenshtein, used only to forgive a single slip of the finger. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Every answer we'll accept for a term in a given direction: the main word, the
 * listed alternatives, each "a / b" option on its own, and the version without
 * a parenthetical gloss ("the class (OOP)" -> "the class").
 */
export function acceptedAnswers(term: Term, dir: Dir): string[] {
  const base =
    dir === "nl>en" ? [term.en, ...(term.altEn ?? [])] : [term.nl, ...(term.altNl ?? [])];
  const out = new Set<string>();
  const add = (s: string) => {
    const v = s.trim();
    if (v) out.add(v);
  };
  for (const raw of base) {
    add(raw);
    const noParen = raw.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    add(noParen);
    for (const piece of [raw, noParen]) {
      for (const alt of piece.split("/")) add(alt);
    }
  }
  return [...out];
}

export type Verdict = "correct" | "typo" | "wrong";

export interface Judgement {
  verdict: Verdict;
  /** The answer we matched (or the canonical one to show when wrong). */
  expected: string;
}

/** Tolerance grows with length: a 10-letter word forgives two slips. */
function allowedSlips(len: number): number {
  if (len >= 8) return 2;
  if (len >= 5) return 1;
  return 0;
}

export function judge(answer: string, accepted: string[]): Judgement {
  const a = normalize(answer);
  const canonical = accepted[0] ?? "";
  if (!a) return { verdict: "wrong", expected: canonical };

  for (const acc of accepted) {
    const n = normalize(acc);
    if (a === n) return { verdict: "correct", expected: acc };
  }
  // Article-insensitive: typing "bestand" for "het bestand" is understood.
  for (const acc of accepted) {
    if (stripLead(a) === stripLead(normalize(acc))) return { verdict: "correct", expected: acc };
  }
  // Near-miss: accept but tell them how it's spelled.
  for (const acc of accepted) {
    const n = stripLead(normalize(acc));
    const d = editDistance(stripLead(a), n);
    if (d > 0 && d <= allowedSlips(n.length)) return { verdict: "typo", expected: acc };
  }
  return { verdict: "wrong", expected: canonical };
}
