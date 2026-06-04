import { proficiencyBonus } from "./proficiency";
import type { Attr, ProficiencyRank } from "./types";

export const ATTRS: Attr[] = ["str", "dex", "con", "int", "wis", "cha"];

export const ATTR_NAME: Record<Attr, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

function blank(): Record<Attr, number> {
  return { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
}

/**
 * Compute level-1 attribute MODIFIERS the Remaster way.
 *
 * Everyone starts at +0. A flaw is −1; each boost is +1. Boosts come in
 * batches (ancestry, background, class key, and the four free boosts), and
 * within a single batch each boost must go to a different attribute — that
 * constraint is enforced by the builder UI. At character creation no modifier
 * can exceed +4, so a boost landing on an already-+4 attribute is wasted.
 */
export function computeAttributes(
  boostBatches: Attr[][],
  flaws: Attr[] = [],
  creationCap = 4,
): Record<Attr, number> {
  const mod = blank();
  for (const f of flaws) mod[f] -= 1;
  for (const batch of boostBatches) {
    for (const a of batch) mod[a] = Math.min(creationCap, mod[a] + 1);
  }
  return mod;
}

export interface DeriveInput {
  level: number;
  attrs: Record<Attr, number>;
  ancestryHp: number;
  classHp: number;
  keyAttr: Attr;
  perceptionRank: ProficiencyRank;
  saveRanks: { fort: ProficiencyRank; ref: ProficiencyRank; will: ProficiencyRank };
  classDcRank: ProficiencyRank;
  armor: { itemBonus: number; dexCap: number | null; rank: ProficiencyRank };
  weapon: { attr: Attr; rank: ProficiencyRank };
  speed: number;
  /** Present only for spellcasters; spell stats key off the class key attribute. */
  spell?: { rank: ProficiencyRank };
}

export interface DerivedStats {
  hp: number;
  ac: number;
  fort: number;
  ref: number;
  will: number;
  perception: number;
  classDc: number;
  attack: number;
  speed: number;
  spellDc?: number;
  spellAttack?: number;
}

/** Derive the level-1 sheet numbers from attributes + class/ancestry data. */
export function deriveStats(input: DeriveInput): DerivedStats {
  const { level, attrs, armor } = input;
  const dexToAc = armor.dexCap === null ? attrs.dex : Math.min(attrs.dex, armor.dexCap);

  const stats: DerivedStats = {
    hp: input.ancestryHp + (input.classHp + attrs.con) * level,
    ac: 10 + dexToAc + proficiencyBonus(armor.rank, level) + armor.itemBonus,
    fort: proficiencyBonus(input.saveRanks.fort, level) + attrs.con,
    ref: proficiencyBonus(input.saveRanks.ref, level) + attrs.dex,
    will: proficiencyBonus(input.saveRanks.will, level) + attrs.wis,
    perception: proficiencyBonus(input.perceptionRank, level) + attrs.wis,
    classDc: 10 + proficiencyBonus(input.classDcRank, level) + attrs[input.keyAttr],
    attack: proficiencyBonus(input.weapon.rank, level) + attrs[input.weapon.attr],
    speed: input.speed,
  };

  if (input.spell) {
    stats.spellDc = 10 + proficiencyBonus(input.spell.rank, level) + attrs[input.keyAttr];
    stats.spellAttack = proficiencyBonus(input.spell.rank, level) + attrs[input.keyAttr];
  }
  return stats;
}
