import { describe, it, expect } from "vitest";
import { quickBuild, isComplete } from "./builder";
import { combatHeroFromBuild } from "./heroFromBuild";
import { PREGEN_HERO } from "./hero";

describe("combatHeroFromBuild", () => {
  it("a quick-built character is complete and converts to its own combat hero", () => {
    const b = quickBuild("Testhero");
    expect(isComplete(b)).toBe(true);
    const h = combatHeroFromBuild(b);
    expect(h).not.toBe(PREGEN_HERO);
    expect(h.name).toBe("Testhero");
    expect(typeof h.combat.ac).toBe("number");
  });
});
