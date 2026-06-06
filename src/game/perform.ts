import { resolveCheck } from "@/engine/check";
import { rollD20 } from "@/engine/dice";
import { proficiencyBonus } from "@/engine/proficiency";
import { stackingBreakdown } from "@/engine/stacking";
import type { Attr, CheckResult, Modifier, ProficiencyRank } from "@/engine/types";
import type { Hero } from "./hero";

const ATTR_LABEL: Record<Attr, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const RANK_LABEL: Record<ProficiencyRank, string> = {
  untrained: "Untrained",
  trained: "Trained",
  expert: "Expert",
  master: "Master",
  legendary: "Legendary",
};

export interface CheckSpec {
  /** Display name of the check, e.g. "Athletics". */
  label: string;
  /** The skill key used to look up the hero's proficiency rank. */
  skill: string;
  attr: Attr;
  dc: number;
  /** Situational typed modifiers (e.g. a circumstance bonus from a helper). */
  modifiers?: Modifier[];
}

export interface BreakdownItem {
  label: string;
  value: number;
  kind: "die" | "proficiency" | "attribute" | "modifier";
  /** True if a typed modifier was overruled by the stacking rules. */
  dropped?: boolean;
}

export interface PerformedCheck extends CheckResult {
  spec: CheckSpec;
  modifierTotal: number;
  breakdown: BreakdownItem[];
}

/** Compute a hero's total modifier and labeled breakdown for a check, without rolling. */
export function checkModifier(
  hero: Hero,
  spec: CheckSpec,
): { rank: ProficiencyRank; prof: number; modifierTotal: number; breakdown: BreakdownItem[] } {
  const rank = hero.skills[spec.skill] ?? "untrained";
  const prof = proficiencyBonus(rank, hero.level);
  const attrMod = hero.attrs[spec.attr];
  const { total: modsTotal, items } = stackingBreakdown(spec.modifiers ?? []);
  const modifierTotal = prof + attrMod + modsTotal;

  const breakdown: BreakdownItem[] = [
    { label: "d20 roll", value: 0, kind: "die" },
    {
      label: `${RANK_LABEL[rank]} ${spec.label}${
        rank === "untrained" ? "" : ` (+${proficiencyBonus(rank, 0)} & +${hero.level} level)`
      }`,
      value: prof,
      kind: "proficiency",
    },
    { label: ATTR_LABEL[spec.attr], value: attrMod, kind: "attribute" },
    ...items.map((i) => ({
      label: `${i.source} (${i.type})`,
      value: i.value,
      kind: "modifier" as const,
      dropped: i.dropped,
    })),
  ];
  return { rank, prof, modifierTotal, breakdown };
}

export interface DegreeOdds {
  "critical-success": number;
  success: number;
  failure: number;
  "critical-failure": number;
}

/**
 * Exact probability of each degree for `d20 + modifierTotal vs dc`, enumerated
 * over all 20 faces (so the nat-1/nat-20 step is baked in). Returned as
 * fractions in [0,1]. Surfacing these before a roll is both a research-backed
 * "show the odds" technique and a direct teaching aid for the DC↔modifier math.
 */
export function degreeOdds(modifierTotal: number, dc: number): DegreeOdds {
  const tally: DegreeOdds = {
    "critical-success": 0,
    success: 0,
    failure: 0,
    "critical-failure": 0,
  };
  for (let die = 1; die <= 20; die++) {
    const { degree } = resolveCheck(die, die + modifierTotal, dc);
    tally[degree] += 1 / 20;
  }
  return tally;
}

/**
 * Roll a hero's check and assemble the labeled, ordered list of addends. The
 * breakdown deliberately mirrors how a person adds up a real PF2e check:
 * the d20, then proficiency (rank + level), then the ability modifier, then any
 * situational bonuses/penalties.
 */
export function performCheck(
  hero: Hero,
  spec: CheckSpec,
  forcedDie?: number,
): PerformedCheck {
  const { modifierTotal, breakdown } = checkModifier(hero, spec);
  const die = forcedDie ?? rollD20();
  breakdown[0] = { ...breakdown[0], value: die }; // fill in the rolled d20
  const total = die + modifierTotal;

  return {
    ...resolveCheck(die, total, spec.dc),
    spec,
    modifierTotal,
    breakdown,
  };
}
