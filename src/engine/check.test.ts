import { describe, expect, it } from "vitest";
import { baseDegree, resolveCheck } from "./check";

describe("baseDegree (numbers only, no natural die)", () => {
  it("crit success when total >= DC + 10", () => {
    expect(baseDegree(25, 15)).toBe("critical-success");
    expect(baseDegree(24, 15)).toBe("success"); // one short of crit
  });
  it("success when DC <= total < DC + 10", () => {
    expect(baseDegree(15, 15)).toBe("success");
  });
  it("failure when DC - 10 < total < DC", () => {
    expect(baseDegree(14, 15)).toBe("failure");
    expect(baseDegree(6, 15)).toBe("failure");
  });
  it("crit failure when total <= DC - 10", () => {
    expect(baseDegree(5, 15)).toBe("critical-failure");
  });
});

describe("resolveCheck — natural-die truth table", () => {
  // [die, total, dc, expectedDegree, expectedShift]
  const cases: [number, number, number, string, "up" | "down" | null][] = [
    [10, 25, 15, "critical-success", null],
    [10, 15, 15, "success", null],
    [10, 14, 15, "failure", null],
    [10, 5, 15, "critical-failure", null],
    // nat 20 bumps one step up
    [20, 14, 15, "success", "up"],
    [20, 5, 15, "failure", "up"],
    // nat 20 cannot exceed crit success (no phantom shift recorded)
    [20, 30, 15, "critical-success", null],
    // nat 1 bumps one step down
    [1, 30, 15, "success", "down"],
    [1, 15, 15, "failure", "down"],
    // nat 1 cannot drop below crit failure
    [1, 4, 15, "critical-failure", null],
  ];

  for (const [die, total, dc, degree, shifted] of cases) {
    it(`die=${die} total=${total} dc=${dc} -> ${degree} (${shifted ?? "no shift"})`, () => {
      const r = resolveCheck(die, total, dc);
      expect(r.degree).toBe(degree);
      expect(r.shifted).toBe(shifted);
    });
  }

  it("exposes the pre-shift base degree for teaching", () => {
    const r = resolveCheck(20, 14, 15);
    expect(r.baseDegree).toBe("failure");
    expect(r.degree).toBe("success");
  });
});
