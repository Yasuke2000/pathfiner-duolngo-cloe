import { normalize, stripLead } from "./grade";
import type { Term, Unit } from "./types";
import { UNITS } from "./vocab";

export interface SearchHit {
  unit: Unit;
  term: Term;
  /** Lower is better. */
  rank: number;
}

/**
 * Dictionary lookup across the whole course, in either language. She hears a
 * word in a lecture, types it — with or without article, accents or capitals —
 * and gets the meaning, the explanation and the usage note.
 */
export function searchTerms(query: string, limit = 40): SearchHit[] {
  const q = stripLead(normalize(query));
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const unit of UNITS) {
    for (const term of unit.terms) {
      const fields = [term.nl, term.en, ...(term.altNl ?? []), ...(term.altEn ?? [])].map((f) =>
        stripLead(normalize(f)),
      );
      let rank = Infinity;
      for (const f of fields) {
        if (f === q) rank = Math.min(rank, 0);
        else if (f.startsWith(q)) rank = Math.min(rank, 1);
        else if (f.split(/[\s/-]+/).some((w) => w.startsWith(q))) rank = Math.min(rank, 2);
        else if (f.includes(q)) rank = Math.min(rank, 3);
      }
      // Whole sentences are useful context, but a word match should come first.
      if (rank !== Infinity) hits.push({ unit, term, rank: rank + (term.kind === "sentence" ? 4 : 0) });
    }
  }
  hits.sort((a, b) => a.rank - b.rank || a.term.nl.length - b.term.nl.length);
  return hits.slice(0, limit);
}
