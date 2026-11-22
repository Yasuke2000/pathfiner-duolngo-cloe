import { describe, expect, it } from "vitest";
import { buildLesson, expectedOf, selectTerms, type PoolItem } from "./lesson";
import { review, type ProgressMap } from "./srs";
import { termId } from "./types";
import { UNITS, UNIT_BY_ID } from "./vocab";

const unit = UNIT_BY_ID.get("computer")!;
const pool: PoolItem[] = unit.terms.map((term) => ({ unitId: unit.id, term }));
const NOW = 1_700_000_000_000;

describe("the vocabulary itself", () => {
  it("has units, and every term has both sides", () => {
    expect(UNITS.length).toBeGreaterThanOrEqual(10);
    for (const u of UNITS) {
      expect(u.terms.length).toBeGreaterThan(0);
      for (const t of u.terms) {
        expect(t.nl.trim()).not.toBe("");
        expect(t.en.trim()).not.toBe("");
      }
    }
  });

  it("gives every term a unique id within its unit", () => {
    for (const u of UNITS) {
      const ids = u.terms.map((t) => termId(u.id, t.nl));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("selectTerms", () => {
  it("returns at most the requested size", () => {
    expect(selectTerms(pool, { size: 8, seed: 3 })).toHaveLength(8);
  });

  it("puts due terms ahead of ones that are still resting", () => {
    const resting = pool[0];
    const due = pool[1];
    const progress: ProgressMap = {
      [termId(resting.unitId, resting.term.nl)]: review(undefined, true, NOW),
      [termId(due.unitId, due.term.nl)]: { box: 1, due: NOW - 1000, seen: 1, correct: 0 },
    };
    // Only these two are known; everything else is new. The due one must be
    // picked before the resting one.
    const picked = selectTerms(pool, { size: pool.length, seed: 2, progress, now: NOW });
    const names = picked.map((p) => p.term.nl);
    expect(names.indexOf(due.term.nl)).toBeLessThan(names.indexOf(resting.term.nl));
  });
});

describe("buildLesson", () => {
  it("builds the requested number of exercises", () => {
    expect(buildLesson(pool, { size: 10, seed: 1 })).toHaveLength(10);
  });

  it("introduces unseen words by recognition, never by making you produce them", () => {
    // No progress at all => every term is brand new.
    for (const ex of buildLesson(pool, { size: 12, seed: 4 })) {
      expect(ex.kind).toBe("choose");
    }
  });

  it("offers four distinct options including the right one", () => {
    for (const ex of buildLesson(pool, { size: 12, seed: 6 })) {
      if (ex.kind !== "choose") continue;
      expect(ex.options).toHaveLength(4);
      expect(new Set(ex.options).size).toBe(4);
      expect(ex.options).toContain(ex.answer);
    }
  });

  it("moves on to recall once a word has been seen", () => {
    const progress: ProgressMap = {};
    for (const p of pool) progress[termId(p.unitId, p.term.nl)] = review(undefined, true, NOW);
    const kinds = new Set(
      buildLesson(pool, { size: 12, seed: 9, progress, now: NOW + 1e9, audio: true }).map((e) => e.kind),
    );
    expect(kinds.has("choose") && kinds.size === 1).toBe(false);
  });

  it("only asks de/het about nouns, and asks for the right article", () => {
    const progress: ProgressMap = {};
    for (const p of pool) progress[termId(p.unitId, p.term.nl)] = review(undefined, true, NOW);
    for (let seed = 0; seed < 25; seed++) {
      for (const ex of buildLesson(pool, { size: 12, seed, progress, now: NOW + 1e9 })) {
        if (ex.kind !== "article") continue;
        expect(ex.term.nl.toLowerCase()).toContain(`${ex.answer} ${ex.noun.toLowerCase()}`);
      }
    }
  });

  it("is deterministic for a given seed", () => {
    const a = buildLesson(pool, { size: 10, seed: 42 });
    const b = buildLesson(pool, { size: 10, seed: 42 });
    expect(a.map((e) => `${e.kind}:${e.id}`)).toEqual(b.map((e) => `${e.kind}:${e.id}`));
  });

  it("always knows what the right answer was", () => {
    for (const ex of buildLesson(pool, { size: 12, seed: 11 })) {
      expect(expectedOf(ex).length).toBeGreaterThan(0);
    }
  });
});
