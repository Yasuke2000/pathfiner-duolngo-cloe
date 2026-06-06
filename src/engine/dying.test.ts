import { describe, expect, it } from "vitest";
import { deathThreshold, dyingOnKnockout, recoveryCheck } from "./dying";

describe("dyingOnKnockout", () => {
  it("is 1 from a normal knockout with no wounds", () => {
    expect(dyingOnKnockout(0)).toBe(1);
  });
  it("is 2 from a critical hit / critically-failed save", () => {
    expect(dyingOnKnockout(0, true)).toBe(2);
  });
  it("adds the wounded value (the silent killer)", () => {
    expect(dyingOnKnockout(1)).toBe(2);
    expect(dyingOnKnockout(2, true)).toBe(4);
  });
});

describe("deathThreshold", () => {
  it("is 4 normally and lower when doomed", () => {
    expect(deathThreshold(0)).toBe(4);
    expect(deathThreshold(1)).toBe(3);
  });
});

describe("recoveryCheck", () => {
  const st = (dying: number, wounded = 0, doomed = 0) => ({ dying, wounded, doomed });

  it("success reduces dying by 1; reaching 0 stabilizes and raises wounded", () => {
    const r = recoveryCheck(st(1), 11); // DC 11, success
    expect(r.degree).toBe("success");
    expect(r.state.dying).toBe(0);
    expect(r.stabilized).toBe(true);
    expect(r.state.wounded).toBe(1);
  });

  it("critical success reduces dying by 2", () => {
    const r = recoveryCheck(st(2), 20); // nat 20 -> crit success
    expect(r.degree).toBe("critical-success");
    expect(r.state.dying).toBe(0);
    expect(r.stabilized).toBe(true);
  });

  it("failure increases dying by 1 + wounded (Remaster)", () => {
    const r = recoveryCheck(st(1, 1), 5); // DC 11, die 5 -> failure
    expect(r.degree).toBe("failure");
    expect(r.state.dying).toBe(3); // 1 + (1 + wounded 1)
    expect(r.dead).toBe(false);
  });

  it("critical failure increases dying by 2 + wounded", () => {
    const r = recoveryCheck(st(1, 0), 1); // nat 1 -> crit failure, +2
    expect(r.degree).toBe("critical-failure");
    expect(r.state.dying).toBe(3);
  });

  it("reaching the death threshold marks dead", () => {
    const r = recoveryCheck(st(3), 5); // DC 13, die 5 -> failure -> dying 4
    expect(r.state.dying).toBe(4);
    expect(r.dead).toBe(true);
  });

  it("uses DC 10 + dying value", () => {
    expect(recoveryCheck(st(2), 12).dc).toBe(12);
  });
});
