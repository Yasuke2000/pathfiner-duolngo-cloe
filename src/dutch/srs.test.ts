import { describe, expect, it } from "vitest";
import { INTERVALS, MAX_BOX, isDue, isMastered, masteredCount, review, strength, type ProgressMap } from "./srs";

const NOW = 1_700_000_000_000;

describe("review", () => {
  it("promotes a correct answer one box and schedules it further out", () => {
    const first = review(undefined, true, NOW);
    expect(first.box).toBe(1);
    expect(first.due).toBe(NOW + INTERVALS[1]);
    expect(first.seen).toBe(1);
    expect(first.correct).toBe(1);

    const second = review(first, true, NOW);
    expect(second.box).toBe(2);
    expect(second.due).toBeGreaterThan(first.due);
  });

  it("caps at the last box", () => {
    let s = review(undefined, true, NOW);
    for (let i = 0; i < 10; i++) s = review(s, true, NOW);
    expect(s.box).toBe(MAX_BOX);
  });

  it("drops a missed term back to the front of the queue", () => {
    let s = review(undefined, true, NOW);
    s = review(s, true, NOW);
    s = review(s, true, NOW);
    expect(s.box).toBe(3);
    const missed = review(s, false, NOW);
    expect(missed.box).toBe(1);
    expect(missed.seen).toBe(4);
    expect(missed.correct).toBe(3);
  });
});

describe("isDue", () => {
  it("treats a term that has never been seen as due", () => {
    expect(isDue(undefined, NOW)).toBe(true);
  });

  it("is not due while it is resting, and due once the interval passes", () => {
    const s = review(undefined, true, NOW);
    expect(isDue(s, NOW)).toBe(false);
    expect(isDue(s, NOW + INTERVALS[1])).toBe(true);
  });
});

describe("mastery", () => {
  it("counts only terms that survived to the long intervals", () => {
    let strong = review(undefined, true, NOW);
    for (let i = 0; i < 3; i++) strong = review(strong, true, NOW);
    const weak = review(undefined, true, NOW);
    const progress: ProgressMap = { strong, weak };

    expect(isMastered(strong)).toBe(true);
    expect(isMastered(weak)).toBe(false);
    expect(masteredCount(["strong", "weak", "unseen"], progress)).toBe(1);
  });

  it("reports strength between 0 and 1", () => {
    expect(strength([], {})).toBe(0);
    expect(strength(["a"], {})).toBe(0);
    let maxed = review(undefined, true, NOW);
    for (let i = 0; i < 6; i++) maxed = review(maxed, true, NOW);
    expect(strength(["a"], { a: maxed })).toBe(1);
  });
});
