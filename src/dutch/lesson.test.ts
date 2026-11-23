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

  it("covers both tracks, and tags every unit with one", () => {
    const tracks = new Set(UNITS.map((u) => u.track));
    expect(tracks).toEqual(new Set(["life", "cs"]));
    expect(UNITS.filter((u) => u.track === "cs").length).toBeGreaterThanOrEqual(10);
  });

  it("teaches the CS vocabulary, not just translates it", () => {
    // The point of the CS track is that a first-year meets the concept and the
    // Dutch word together, so most technical terms must say what they ARE.
    const csTerms = UNITS.filter((u) => u.track === "cs").flatMap((u) => u.terms);
    expect(csTerms.length).toBeGreaterThanOrEqual(250);
    const withDef = csTerms.filter((t) => t.def && t.def.length > 20);
    expect(withDef.length / csTerms.length).toBeGreaterThan(0.4);
    const withExample = UNITS.flatMap((u) => u.terms).filter((t) => t.example);
    expect(withExample.length).toBeGreaterThanOrEqual(30);
  });

  it("keeps example sentences in Dutch and English, both non-empty", () => {
    for (const u of UNITS) {
      for (const t of u.terms) {
        if (!t.example) continue;
        expect(t.example.nl.trim().length).toBeGreaterThan(0);
        expect(t.example.en.trim().length).toBeGreaterThan(0);
        // A word-bank exercise needs something to arrange.
        expect(t.example.nl.trim().split(/\s+/).length).toBeGreaterThan(2);
      }
    }
  });

  it("teaches how to read Dutch variable names, ambiguity included", () => {
    const namen = UNIT_BY_ID.get("namen");
    expect(namen).toBeDefined();
    expect(namen!.terms.length).toBeGreaterThanOrEqual(30);
    // Most entries must say what the variable actually HOLDS, not just translate.
    const withDef = namen!.terms.filter((t) => t.def);
    expect(withDef.length / namen!.terms.length).toBeGreaterThan(0.7);
    // The trap worth failing a test over: teller = counter, but also numerator.
    const teller = namen!.terms.find((t) => t.nl === "de teller");
    expect(teller?.note).toMatch(/noemer|numerator/i);
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

  it("never offers the same option twice, in any unit, new or seen", () => {
    // Regression: "merci" and "bedankt" both translate to "thanks", and both
    // could turn up as options in one question.
    for (const u of UNITS) {
      const unitPool: PoolItem[] = u.terms.map((term) => ({ unitId: u.id, term }));
      const seenAll: ProgressMap = {};
      for (const p of unitPool) seenAll[termId(p.unitId, p.term.nl)] = review(undefined, true, NOW);
      for (let seed = 0; seed < 12; seed++) {
        for (const progress of [{}, seenAll]) {
          for (const ex of buildLesson(unitPool, { size: 12, seed, progress, now: NOW + 1e9 })) {
            if (ex.kind !== "choose") continue;
            expect(new Set(ex.options).size, `${u.id}: ${ex.options.join(" | ")}`).toBe(ex.options.length);
            expect(ex.options).toContain(ex.answer);
            expect(ex.options.length).toBeGreaterThanOrEqual(2);
          }
        }
      }
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
