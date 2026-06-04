import type { Attr, ProficiencyRank } from "@/engine/types";

export interface Hero {
  name: string;
  archetype: string;
  level: number;
  attrs: Record<Attr, number>;
  /** Proficiency rank per skill key (only what the slice needs). */
  skills: Partial<Record<string, ProficiencyRank>>;
}

/**
 * The pregenerated hero the learner pilots through the opening lesson. Real
 * character creation is a later unit; for the vertical slice the numbers are
 * fixed and chosen so a d20 produces a satisfying spread of all four degrees.
 */
export const PREGEN_HERO: Hero = {
  name: "Wren",
  archetype: "a green but game frontier scout",
  level: 1,
  attrs: { str: 4, dex: 3, con: 2, int: 0, wis: 1, cha: 1 },
  skills: {
    athletics: "trained", // Str +4, trained (+2) + level 1 = +7 before situational mods
    acrobatics: "trained",
  },
};
