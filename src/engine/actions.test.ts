import { describe, expect, it } from "vitest";
import {
  multipleAttackPenalty,
  mapModifier,
  spendAction,
  startTurn,
} from "./actions";

describe("multipleAttackPenalty", () => {
  it("is 0 on the first attack of the turn", () => {
    expect(multipleAttackPenalty(0)).toBe(0);
  });
  it("is -5 / -10 on the second / third+ attack", () => {
    expect(multipleAttackPenalty(1)).toBe(-5);
    expect(multipleAttackPenalty(2)).toBe(-10);
    expect(multipleAttackPenalty(3)).toBe(-10);
  });
  it("softens to -4 / -8 with an agile weapon", () => {
    expect(multipleAttackPenalty(1, true)).toBe(-4);
    expect(multipleAttackPenalty(2, true)).toBe(-8);
  });
  it("exposes itself as an untyped modifier", () => {
    expect(mapModifier(1)).toEqual({
      type: "untyped",
      value: -5,
      source: "multiple attack penalty",
    });
  });
});

describe("startTurn", () => {
  it("grants 3 actions by default and refreshes the reaction", () => {
    const t = startTurn();
    expect(t.actionsRemaining).toBe(3);
    expect(t.reactionAvailable).toBe(true);
    expect(t.attacksThisTurn).toBe(0);
  });
  it("adds one for quickened", () => {
    expect(startTurn({ quickened: true }).actionsRemaining).toBe(4);
  });
  it("removes the GREATER of slowed/stunned (they do not add)", () => {
    expect(startTurn({ slowed: 1, stunned: 2 }).actionsRemaining).toBe(1);
  });
  it("never drops below zero", () => {
    expect(startTurn({ stunned: 5 }).actionsRemaining).toBe(0);
  });
});

describe("spendAction", () => {
  it("decrements actions and counts attacks", () => {
    const t = spendAction(startTurn(), 1, true);
    expect(t.actionsRemaining).toBe(2);
    expect(t.attacksThisTurn).toBe(1);
  });
  it("does not count non-attack actions toward MAP", () => {
    expect(spendAction(startTurn(), 1, false).attacksThisTurn).toBe(0);
  });
  it("throws when there aren't enough actions", () => {
    expect(() => spendAction(startTurn(), 4)).toThrow();
  });
});
