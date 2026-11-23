import { describe, expect, it } from "vitest";
import { GRAMMAR } from "./grammar";
import { GROUPS, recommend, statsFor, unitIds, unitsOf, unplacedUnits } from "./path";
import { review, type ProgressMap } from "./srs";
import { UNITS, UNIT_BY_ID } from "./vocab";

const NOW = 1_700_000_000_000;

describe("the learning path", () => {
  it("places every unit exactly once", () => {
    expect(unplacedUnits()).toEqual([]);
    const all = GROUPS.flatMap((g) => g.unitIds);
    expect(new Set(all).size).toBe(all.length);
    for (const id of all) expect(UNIT_BY_ID.has(id), `unknown unit "${id}"`).toBe(true);
    expect(all.length).toBe(UNITS.length);
  });

  it("starts a brand-new learner at the very first unit", () => {
    const rec = recommend({}, NOW, 0);
    expect(rec.kind).toBe("unit");
    if (rec.kind !== "unit") return;
    expect(rec.unit.id).toBe(GROUPS[0].unitIds[0]);
    expect(rec.started).toBe(false);
  });

  it("moves on to the next unit once a unit has been fully seen", () => {
    const first = unitsOf(GROUPS[0])[0];
    const progress: ProgressMap = {};
    for (const id of unitIds(first)) progress[id] = review(undefined, true, NOW);
    const rec = recommend(progress, NOW, 0);
    expect(rec.kind).toBe("unit");
    if (rec.kind === "unit") expect(rec.unit.id).toBe(GROUPS[0].unitIds[1]);
  });

  it("puts review first once enough is due", () => {
    expect(recommend({}, NOW, 8)).toEqual({ kind: "review", due: 8 });
    expect(recommend({}, NOW, 3).kind).toBe("unit");
  });

  it("counts seen, mastered and due", () => {
    let strong = review(undefined, true, NOW);
    for (let i = 0; i < 3; i++) strong = review(strong, true, NOW);
    const progress: ProgressMap = {
      a: strong,
      b: { box: 1, due: NOW - 1, seen: 1, correct: 0 },
    };
    expect(statsFor(["a", "b", "c"], progress, NOW)).toEqual({ total: 3, seen: 2, mastered: 1, due: 1 });
  });
});

describe("the grammar reference", () => {
  it("covers the rules that matter most, each with points and examples", () => {
    const ids = GRAMMAR.map((g) => g.id);
    for (const must of ["de-het", "v2", "bijzin", "scheidbaar", "niet-geen"]) expect(ids).toContain(must);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of GRAMMAR) {
      expect(g.summary.length).toBeGreaterThan(30);
      expect(g.points.length).toBeGreaterThanOrEqual(3);
      expect(g.examples.length).toBeGreaterThanOrEqual(2);
      for (const e of g.examples) {
        expect(e.nl.trim()).not.toBe("");
        expect(e.en.trim()).not.toBe("");
      }
    }
  });
});
