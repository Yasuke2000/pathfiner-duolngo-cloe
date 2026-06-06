import type { Attr, ProficiencyRank } from "@/engine/types";

export interface HeroCombat {
  ac: number;
  maxHp: number;
  /** Attack roll bonus with the hero's main weapon (before MAP). */
  strikeBonus: number;
  strikeDamageDie: number;
  strikeDamageBonus: number;
  /** Whether the main weapon has the agile trait (softer MAP). */
  agile: boolean;
  /** Bonus to the Demoralize check (Intimidation). */
  intimidationBonus: number;
}

export interface Hero {
  name: string;
  archetype: string;
  level: number;
  attrs: Record<Attr, number>;
  /** Proficiency rank per skill key (only what the slice needs). */
  skills: Partial<Record<string, ProficiencyRank>>;
  combat: HeroCombat;
}

/**
 * The pregenerated hero the learner pilots through the opening lessons. Real
 * character creation is a later unit; for the vertical slice the numbers are
 * fixed and tuned so the dice produce a satisfying spread of outcomes — and so
 * the three-action duel is winnable but rewards smart action choices.
 */
export const PREGEN_HERO: Hero = {
  name: "You",
  archetype: "a green but game frontier scout",
  level: 1,
  attrs: { str: 4, dex: 3, con: 2, int: 0, wis: 1, cha: 1 },
  skills: {
    athletics: "trained", // Str +4, trained (+2) + level 1 = +7 before situational mods
    acrobatics: "trained",
  },
  combat: {
    ac: 17,
    maxHp: 20,
    strikeBonus: 9, // hits AC 16 on a 7+; the MAP makes the 2nd/3rd swing bite
    strikeDamageDie: 8,
    strikeDamageBonus: 4,
    agile: false,
    intimidationBonus: 6,
  },
};
