import { describe, expect, it } from "vitest";
import type { PoolItem } from "./lesson";
import { recordAnswer, type DutchSave } from "./progress";
import { accuracy, activitySeries, strengthBuckets, weakest } from "./stats";
import type { ProgressMap } from "./srs";
import { termId } from "./types";

const T0 = new Date(2026, 2, 10, 12, 0, 0).getTime();
const DAY = 24 * 60 * 60 * 1000;
const fresh = (): DutchSave => ({ terms: {}, xp: 0, lessons: 0 });

describe("activitySeries", () => {
  it("returns exactly the requested days, oldest first, ending today", () => {
    const s = activitySeries(null, T0, 14);
    expect(s).toHaveLength(14);
    expect(s[13].isToday).toBe(true);
    expect(s.filter((d) => d.isToday)).toHaveLength(1);
    expect(s.every((d) => d.xp === 0)).toBe(true);
    expect(s[0].day < s[13].day).toBe(true);
  });

  it("places each day's XP on the right day", () => {
    let save = recordAnswer(fresh(), "a", true, T0 - 2 * DAY);
    save = recordAnswer(save, "b", true, T0);
    save = recordAnswer(save, "c", false, T0);
    const s = activitySeries(save, T0, 14);
    expect(s[11]).toMatchObject({ xp: 10, n: 1, ok: 1 });
    expect(s[12].xp).toBe(0);
    expect(s[13]).toMatchObject({ xp: 12, n: 2, ok: 1 });
  });
});

describe("accuracy", () => {
  it("is null before any answer, then the share answered correctly", () => {
    expect(accuracy({}).pct).toBeNull();
    const progress: ProgressMap = {
      a: { box: 2, due: 0, seen: 3, correct: 3 },
      b: { box: 1, due: 0, seen: 1, correct: 0 },
    };
    expect(accuracy(progress)).toEqual({ answers: 4, correct: 3, pct: 75 });
  });
});

describe("strengthBuckets", () => {
  it("sorts every id into exactly one bucket", () => {
    const progress: ProgressMap = {
      l1: { box: 1, due: 0, seen: 1, correct: 1 },
      l2: { box: 2, due: 0, seen: 2, correct: 2 },
      a: { box: 3, due: 0, seen: 3, correct: 3 },
      k4: { box: 4, due: 0, seen: 4, correct: 4 },
      k5: { box: 5, due: 0, seen: 9, correct: 9 },
    };
    const b = strengthBuckets(["l1", "l2", "a", "k4", "k5", "new1", "new2"], progress);
    expect(b).toEqual({ unseen: 2, learning: 2, almost: 1, known: 2 });
    expect(b.unseen + b.learning + b.almost + b.known).toBe(7);
  });
});

describe("weakest", () => {
  const item = (nl: string): PoolItem => ({ unitId: "u", term: { nl, en: nl } });
  const pool = ["goed", "slecht", "slechter", "een keer", "nieuw"].map(item);
  const id = (nl: string) => termId("u", nl);
  const progress: ProgressMap = {
    [id("goed")]: { box: 4, due: 0, seen: 10, correct: 9 },
    [id("slecht")]: { box: 1, due: 0, seen: 4, correct: 2 },
    [id("slechter")]: { box: 1, due: 0, seen: 5, correct: 1 },
    [id("een keer")]: { box: 1, due: 0, seen: 1, correct: 0 },
  };

  it("lists the words that keep going wrong, worst first", () => {
    expect(weakest(pool, progress).map((w) => w.term.nl)).toEqual(["slechter", "slecht"]);
  });

  it("ignores words seen only once, words never seen, and words that go well", () => {
    const names = weakest(pool, progress).map((w) => w.term.nl);
    expect(names).not.toContain("een keer");
    expect(names).not.toContain("nieuw");
    expect(names).not.toContain("goed");
  });

  it("respects the limit", () => {
    expect(weakest(pool, progress, 1)).toHaveLength(1);
  });
});
