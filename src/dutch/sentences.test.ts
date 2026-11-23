import { describe, expect, it } from "vitest";
import { SENTENCE_UNITS } from "./vocab-sentences";
import { buildLesson, type PoolItem } from "./lesson";
import { review, type ProgressMap } from "./srs";
import { termId } from "./types";

const NOW = 1_700_000_000_000;
const unit = SENTENCE_UNITS[0];
const pool: PoolItem[] = unit.terms.map((term) => ({ unitId: unit.id, term }));

describe("sentence units", () => {
  it("marks every entry as a sentence with several words on both sides", () => {
    for (const u of SENTENCE_UNITS) {
      for (const t of u.terms) {
        expect(t.kind).toBe("sentence");
        // Even a greeting like "Geachte professor," is at least two words.
        expect(t.nl.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
        expect(t.en.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("never asks de/het about a sentence, and can assemble it from a word bank", () => {
    const progress: ProgressMap = {};
    for (const p of pool) progress[termId(p.unitId, p.term.nl)] = review(undefined, true, NOW);
    let sawBuild = false;
    for (let seed = 0; seed < 30; seed++) {
      for (const ex of buildLesson(pool, { size: 12, seed, progress, now: NOW + 1e9 })) {
        expect(ex.kind).not.toBe("article");
        if (ex.kind === "build") {
          sawBuild = true;
          // The word bank must hold exactly the words of the target sentence.
          expect([...ex.words].sort()).toEqual([...ex.answer.split(" ")].sort());
          expect(ex.answer).toBe(ex.term.nl);
        }
      }
    }
    expect(sawBuild).toBe(true);
  });
});
