import { describe, expect, it } from "vitest";
import { computeAttributes, deriveStats } from "./character";

describe("computeAttributes", () => {
  it("applies a flaw as -1 and each boost as +1", () => {
    const a = computeAttributes([["con", "wis"]], ["cha"]);
    expect(a.con).toBe(1);
    expect(a.wis).toBe(1);
    expect(a.cha).toBe(-1);
    expect(a.str).toBe(0);
  });

  it("stacks boosts on one attribute across batches up to +4", () => {
    // ancestry, background, class key, and one free boost all on wisdom
    const a = computeAttributes([["wis"], ["wis"], ["wis"], ["wis"]]);
    expect(a.wis).toBe(4);
  });

  it("caps at +4 at creation (extra boosts are wasted)", () => {
    const a = computeAttributes([["str"], ["str"], ["str"], ["str"], ["str"]]);
    expect(a.str).toBe(4);
  });
});

describe("deriveStats", () => {
  // A level-1 fighter-ish build: Str+4, Dex+2, Con+2, Wis+1.
  const base = {
    level: 1,
    attrs: { str: 4, dex: 2, con: 2, int: 0, wis: 1, cha: 0 },
    ancestryHp: 10,
    classHp: 10,
    keyAttr: "str" as const,
    perceptionRank: "expert" as const,
    saveRanks: { fort: "expert" as const, ref: "expert" as const, will: "trained" as const },
    classDcRank: "trained" as const,
    armor: { itemBonus: 3, dexCap: 2, rank: "trained" as const },
    weapon: { attr: "str" as const, rank: "expert" as const },
    speed: 25,
  };

  it("computes HP from ancestry + (class + Con) per level", () => {
    expect(deriveStats(base).hp).toBe(22); // 10 + (10 + 2)
  });

  it("computes AC with the armor's Dex cap applied", () => {
    // 10 + min(dex2, cap2) + trained(2+1) + item3 = 18
    expect(deriveStats(base).ac).toBe(18);
  });

  it("computes saves, perception, class DC and attack", () => {
    const s = deriveStats(base);
    expect(s.fort).toBe(7); // expert(4+1) + con2
    expect(s.will).toBe(4); // trained(2+1) + wis1
    expect(s.perception).toBe(6); // expert(4+1) + wis1
    expect(s.classDc).toBe(17); // 10 + trained(2+1) + str4
    expect(s.attack).toBe(9); // expert(4+1) + str4
  });

  it("adds spell stats only for spellcasters", () => {
    expect(deriveStats(base).spellDc).toBeUndefined();
    const caster = deriveStats({ ...base, keyAttr: "wis", spell: { rank: "trained" } });
    expect(caster.spellDc).toBe(14); // 10 + trained(3) + wis1
  });
});
