import { describe, expect, it } from "vitest";
import { DAILY_GOAL, currentStreak, dayKey, recordAnswer, todayXp, type DutchSave } from "./progress";

const DAY = 24 * 60 * 60 * 1000;
// Noon, so adding whole days never crosses a date boundary in any time zone.
const T0 = new Date(2026, 2, 10, 12, 0, 0).getTime();
const fresh = (): DutchSave => ({ terms: {}, xp: 0, lessons: 0 });

/** Answer correctly until the day's goal is reached. */
function reachGoal(save: DutchSave, now: number): DutchSave {
  let s = save;
  for (let i = 0; todayXp(s, now) < DAILY_GOAL; i++) s = recordAnswer(s, `t${now}-${i}`, true, now);
  return s;
}

describe("recordAnswer", () => {
  it("awards more for a right answer than a wrong one, and schedules the term", () => {
    const right = recordAnswer(fresh(), "a", true, T0);
    const wrong = recordAnswer(fresh(), "a", false, T0);
    expect(right.xp).toBe(10);
    expect(wrong.xp).toBe(2);
    expect(right.terms.a.box).toBe(1);
    expect(todayXp(right, T0)).toBe(10);
  });

  it("starts the day's XP from zero on a new day but keeps the total", () => {
    const day1 = recordAnswer(fresh(), "a", true, T0);
    expect(todayXp(day1, T0 + DAY)).toBe(0);
    const day2 = recordAnswer(day1, "b", true, T0 + DAY);
    expect(todayXp(day2, T0 + DAY)).toBe(10);
    expect(day2.xp).toBe(20);
    expect(day2.day).toBe(dayKey(T0 + DAY));
  });
});

describe("the streak", () => {
  it("is zero until the daily goal is reached, then one", () => {
    const some = recordAnswer(fresh(), "a", true, T0);
    expect(currentStreak(some, T0)).toBe(0);
    expect(currentStreak(reachGoal(fresh(), T0), T0)).toBe(1);
  });

  it("counts the goal only once per day", () => {
    let s = reachGoal(fresh(), T0);
    for (let i = 0; i < 20; i++) s = recordAnswer(s, `extra${i}`, true, T0);
    expect(currentStreak(s, T0)).toBe(1);
  });

  it("grows on consecutive days", () => {
    const d1 = reachGoal(fresh(), T0);
    const d2 = reachGoal(d1, T0 + DAY);
    const d3 = reachGoal(d2, T0 + 2 * DAY);
    expect(currentStreak(d3, T0 + 2 * DAY)).toBe(3);
  });

  it("survives until the end of the next day, then lapses", () => {
    const d1 = reachGoal(fresh(), T0);
    expect(currentStreak(d1, T0 + DAY)).toBe(1); // still time to keep it going
    expect(currentStreak(d1, T0 + 2 * DAY)).toBe(0); // a day was missed
  });

  it("restarts at one after a missed day", () => {
    const d1 = reachGoal(fresh(), T0);
    const d2 = reachGoal(d1, T0 + DAY);
    const later = reachGoal(d2, T0 + 4 * DAY);
    expect(currentStreak(later, T0 + 4 * DAY)).toBe(1);
  });
});
