import { computeAttributes, deriveStats, type DerivedStats } from "@/engine/character";
import type { Attr } from "@/engine/types";
import {
  ANCESTRIES,
  BACKGROUNDS,
  CLASSES,
  SKILLS,
  byId,
  type Ancestry,
  type Background,
  type CharClass,
} from "@/content/srd";

export interface BuildState {
  name: string;
  ancestryId?: string;
  backgroundId?: string;
  classId?: string;
  /** The four free attribute boosts (one batch — must be distinct). */
  freeBoosts: Attr[];
  /** Chosen trained skills, not counting the one the background grants. */
  skills: string[];
  featId?: string;
}

export const emptyBuild = (): BuildState => ({
  name: "",
  freeBoosts: [],
  skills: [],
});

export interface ResolvedBuild {
  ancestry?: Ancestry;
  background?: Background;
  cls?: CharClass;
}

export function resolve(b: BuildState): ResolvedBuild {
  return {
    ancestry: byId(ANCESTRIES, b.ancestryId),
    background: byId(BACKGROUNDS, b.backgroundId),
    cls: byId(CLASSES, b.classId),
  };
}

/** Assemble the attribute boost batches and compute level-1 modifiers. */
export function buildAttrs(b: BuildState): Record<Attr, number> {
  const { ancestry, background, cls } = resolve(b);
  const batches: Attr[][] = [];
  if (ancestry) batches.push(ancestry.boosts);
  if (background) batches.push(background.boosts);
  if (cls) batches.push([cls.keyAttr]);
  if (b.freeBoosts.length) batches.push(b.freeBoosts);
  const flaws = ancestry?.flaw ? [ancestry.flaw] : [];
  return computeAttributes(batches, flaws);
}

/** Number of trained skills the learner picks: class choices + Int modifier. */
export function skillBudget(b: BuildState): number {
  const { cls } = resolve(b);
  if (!cls) return 0;
  const intMod = buildAttrs(b).int;
  return cls.trainedSkillChoices + Math.max(0, intMod);
}

/** All trained skills (background grant + chosen). */
export function trainedSkills(b: BuildState): string[] {
  const { background } = resolve(b);
  const set = new Set<string>(b.skills);
  if (background) set.add(background.skill);
  return [...set];
}

export function derived(b: BuildState): DerivedStats | null {
  const { ancestry, cls } = resolve(b);
  if (!ancestry || !cls) return null;
  const attrs = buildAttrs(b);
  return deriveStats({
    level: 1,
    attrs,
    ancestryHp: ancestry.hp,
    classHp: cls.hp,
    keyAttr: cls.keyAttr,
    perceptionRank: cls.perception,
    saveRanks: cls.saves,
    classDcRank: cls.classDcRank,
    armor: cls.armor,
    weapon: cls.weapon,
    speed: ancestry.speed,
    spell: cls.spell ? { rank: cls.spell.rank } : undefined,
  });
}

export function isComplete(b: BuildState): boolean {
  const { ancestry, background, cls } = resolve(b);
  return (
    b.name.trim().length > 0 &&
    !!ancestry &&
    !!background &&
    !!cls &&
    b.freeBoosts.length === 4 &&
    new Set(b.freeBoosts).size === 4 &&
    b.skills.length === skillBudget(b) &&
    !!b.featId
  );
}

/** A clean, documented JSON export of the finished character. */
export function exportCharacter(b: BuildState) {
  const { ancestry, background, cls } = resolve(b);
  const attrs = buildAttrs(b);
  const stats = derived(b);
  const feat = cls?.feats.find((f) => f.id === b.featId);
  return {
    _format: "pathfinder-learn-and-play.character",
    _version: 1,
    name: b.name.trim() || "Unnamed Hero",
    level: 1,
    ancestry: ancestry?.name,
    background: background?.name,
    class: cls?.name,
    keyAttribute: cls?.keyAttr,
    attributes: attrs,
    trainedSkills: trainedSkills(b).map(
      (k) => SKILLS.find((s) => s.key === k)?.name ?? k,
    ),
    classFeat: feat ? { name: feat.name, description: feat.desc } : undefined,
    derived: stats,
    note:
      "Built with the Learn & Play teaching app. A streamlined level-1 character to bring to your first table.",
  };
}
