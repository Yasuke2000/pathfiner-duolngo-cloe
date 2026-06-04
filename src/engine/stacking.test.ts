import { describe, expect, it } from "vitest";
import { applyStacking, stackingBreakdown } from "./stacking";
import { proficiencyBonus } from "./proficiency";
import type { Modifier } from "./types";

const m = (type: Modifier["type"], value: number, source = type): Modifier => ({
  type,
  value,
  source,
});

describe("applyStacking", () => {
  it("keeps only the highest bonus of a given type", () => {
    expect(applyStacking([m("circumstance", 2), m("circumstance", 1)])).toBe(2);
  });

  it("applies a same-type bonus AND penalty together", () => {
    expect(applyStacking([m("circumstance", 2), m("circumstance", -1)])).toBe(1);
  });

  it("stacks across different bonus types", () => {
    expect(applyStacking([m("item", 1), m("status", 1), m("circumstance", 1)])).toBe(3);
  });

  it("stacks ALL untyped penalties (e.g. multiple attack penalty + range)", () => {
    expect(applyStacking([m("untyped", -5), m("untyped", -2)])).toBe(-7);
  });

  it("ignores disabled modifiers", () => {
    expect(applyStacking([{ ...m("item", 3), enabled: false }])).toBe(0);
  });
});

describe("stackingBreakdown", () => {
  it("flags the overruled (dropped) bonus so the UI can grey it out", () => {
    const { total, items } = stackingBreakdown([
      m("circumstance", 2, "flank"),
      m("circumstance", 1, "aid"),
    ]);
    expect(total).toBe(2);
    expect(items.find((i) => i.source === "flank")?.dropped).toBe(false);
    expect(items.find((i) => i.source === "aid")?.dropped).toBe(true);
  });
});

describe("proficiencyBonus", () => {
  it("adds rank value + level when trained or better", () => {
    expect(proficiencyBonus("trained", 1)).toBe(3); // 2 + 1
    expect(proficiencyBonus("expert", 5)).toBe(9); // 4 + 5
  });
  it("contributes nothing when untrained (never adds level)", () => {
    expect(proficiencyBonus("untrained", 20)).toBe(0);
  });
  it("drops the level term under the proficiency-without-level variant", () => {
    expect(proficiencyBonus("trained", 5, true)).toBe(2);
  });
});
