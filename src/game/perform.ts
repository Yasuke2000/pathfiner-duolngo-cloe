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
  const rank = hero.skills[spec.skill] ?? "untrained";
  const prof = proficiencyBonus(rank, hero.level);
  const attrMod = hero.attrs[spec.attr];
  const { total: modsTotal, items } = stackingBreakdown(spec.modifiers ?? []);

  const die = forcedDie ?? rollD20();
  const modifierTotal = prof + attrMod + modsTotal;
  const total = die + modifierTotal;

  const breakdown: BreakdownItem[] = [
    { label: "d20 roll", value: die, kind: "die" },
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

  return {
    ...resolveCheck(die, total, spec.dc),
    spec,
    modifierTotal,
    breakdown,
  };
}
