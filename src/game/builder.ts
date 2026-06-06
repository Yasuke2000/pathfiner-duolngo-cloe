import { computeAttributes, deriveStats, type DerivedStats } from "@/engine/character";
import type { Attr } from "@/engine/types";
import {
  ANCESTRIES,
  ANCESTRY_FEATS,
  ANCESTRY_LANGUAGES,
  BACKGROUNDS,
  CLASS_GEAR,
  CLASS_SPELLS,
  CLASSES,
  HERITAGES,
  LANGUAGE_POOL,
  SKILLS,
  byId,
  type Ancestry,
  type Background,
  type CharClass,
  type Heritage,
  type SpellcastingDef,
} from "@/content/srd";

export interface BuildState {
  name: string;
  ancestryId?: string;
  heritageId?: string;
  backgroundId?: string;
  classId?: string;
  /** The four free attribute boosts (one batch — must be distinct). */
  freeBoosts: Attr[];
  /** Chosen trained skills, not counting the one the background grants. */
  skills: string[];
  /** Bonus languages chosen (Int-based), beyond the ancestry's granted ones. */
  languages: string[];
  cantrips: string[];
  spells: string[];
  featId?: string;
  ancestryFeatId?: string;
}

export const emptyBuild = (): BuildState => ({
  name: "",
  freeBoosts: [],
  skills: [],
  languages: [],
  cantrips: [],
  spells: [],
});

export interface ResolvedBuild {
  ancestry?: Ancestry;
  heritage?: Heritage;
  background?: Background;
  cls?: CharClass;
}

export function resolve(b: BuildState): ResolvedBuild {
  const ancestry = byId(ANCESTRIES, b.ancestryId);
  return {
    ancestry,
    heritage: ancestry ? byId(HERITAGES[ancestry.id] ?? [], b.heritageId) : undefined,
    background: byId(BACKGROUNDS, b.backgroundId),
    cls: byId(CLASSES, b.classId),
  };
}

export function spellcasting(b: BuildState): SpellcastingDef | undefined {
  return b.classId ? CLASS_SPELLS[b.classId] : undefined;
}

export function grantedLanguages(b: BuildState): string[] {
  return b.ancestryId ? (ANCESTRY_LANGUAGES[b.ancestryId] ?? ["Common"]) : ["Common"];
}

/** Bonus languages the character may pick (their Intelligence modifier, min 0). */
export function languageBudget(b: BuildState): number {
  return Math.max(0, buildAttrs(b).int);
}

export function startingGear(b: BuildState): string[] {
  return b.classId ? (CLASS_GEAR[b.classId] ?? []) : [];
}

export function ancestryFeats(b: BuildState) {
  return b.ancestryId ? (ANCESTRY_FEATS[b.ancestryId] ?? []) : [];
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
  const { ancestry, heritage, background, cls } = resolve(b);
  const sc = spellcasting(b);
  const spellsOk = !sc || (b.cantrips.length === sc.cantripsKnown && b.spells.length === sc.spellsKnown);
  return (
    b.name.trim().length > 0 &&
    !!ancestry &&
    !!heritage &&
    !!background &&
    !!cls &&
    b.freeBoosts.length === 4 &&
    new Set(b.freeBoosts).size === 4 &&
    b.skills.length === skillBudget(b) &&
    b.languages.length === languageBudget(b) &&
    spellsOk &&
    !!b.featId &&
    !!b.ancestryFeatId
  );
}

/** Build a complete, valid, sensible random character (the "surprise me" button). */
export function quickBuild(name: string): BuildState {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const pickN = <T,>(arr: T[], n: number): T[] => {
    const pool = [...arr];
    const out: T[] = [];
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  };

  const ancestry = pick(ANCESTRIES);
  const cls = pick(CLASSES);
  const background = pick(BACKGROUNDS);
  const b: BuildState = {
    ...emptyBuild(),
    name: name.trim() || pick(["Dain", "Sera", "Pib", "Wren", "Kale", "Mira"]),
    ancestryId: ancestry.id,
    heritageId: pick(HERITAGES[ancestry.id]).id,
    backgroundId: background.id,
    classId: cls.id,
    featId: pick(cls.feats).id,
    ancestryFeatId: pick(ANCESTRY_FEATS[ancestry.id]).id,
  };
  // Free boosts: prefer the key attribute, then three other distinct attrs.
  const others = (["str", "dex", "con", "int", "wis", "cha"] as Attr[]).filter((a) => a !== cls.keyAttr);
  b.freeBoosts = [cls.keyAttr, ...pickN(others, 3)];
  b.skills = pickN(
    SKILLS.map((s) => s.key).filter((k) => k !== background.skill),
    skillBudget(b),
  );
  b.languages = pickN(LANGUAGE_POOL.filter((l) => !grantedLanguages(b).includes(l)), languageBudget(b));
  const sc = CLASS_SPELLS[cls.id];
  if (sc) {
    b.cantrips = pickN(sc.cantrips.map((s) => s.id), sc.cantripsKnown);
    b.spells = pickN(sc.spells.map((s) => s.id), sc.spellsKnown);
  }
  return b;
}

/** A clean, documented JSON export of the finished character. */
export function exportCharacter(b: BuildState) {
  const { ancestry, heritage, background, cls } = resolve(b);
  const attrs = buildAttrs(b);
  const stats = derived(b);
  const sc = spellcasting(b);
  const feat = cls?.feats.find((f) => f.id === b.featId);
  const ancFeat = ancestryFeats(b).find((f) => f.id === b.ancestryFeatId);
  const spellName = (id: string) =>
    sc?.cantrips.concat(sc.spells).find((s) => s.id === id)?.name ?? id;
  return {
    _format: "pathfinder-learn-and-play.character",
    _version: 2,
    name: b.name.trim() || "Unnamed Hero",
    level: 1,
    ancestry: ancestry?.name,
    heritage: heritage?.name,
    background: background?.name,
    class: cls?.name,
    keyAttribute: cls?.keyAttr,
    attributes: attrs,
    languages: [...grantedLanguages(b), ...b.languages],
    trainedSkills: trainedSkills(b).map((k) => SKILLS.find((s) => s.key === k)?.name ?? k),
    classFeat: feat ? { name: feat.name, description: feat.desc } : undefined,
    ancestryFeat: ancFeat ? { name: ancFeat.name, description: ancFeat.desc } : undefined,
    spells: sc
      ? { tradition: sc.tradition, cantrips: b.cantrips.map(spellName), spells: b.spells.map(spellName) }
      : undefined,
    equipment: startingGear(b),
    derived: stats,
    note:
      "Built with the Learn & Play teaching app. A streamlined level-1 character to bring to your first table.",
  };
}
