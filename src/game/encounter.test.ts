import { describe, expect, it } from "vitest";
import { basicSaveDamage } from "./encounter";

describe("basicSaveDamage (spell basic save)", () => {
  it("none / half / full / double by the target's save degree", () => {
    expect(basicSaveDamage("critical-success", 10)).toBe(0);
    expect(basicSaveDamage("success", 10)).toBe(5);
    expect(basicSaveDamage("failure", 10)).toBe(10);
    expect(basicSaveDamage("critical-failure", 10)).toBe(20);
  });
  it("floors the half", () => {
    expect(basicSaveDamage("success", 7)).toBe(3);
  });
});
