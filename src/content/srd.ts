import type { Attr, ProficiencyRank } from "@/engine/types";

/**
 * A deliberately streamlined level-1 ruleset for the teaching builder. The
 * formulas are PF2e-correct; the data is a small, beginner-friendly slice
 * (Beginner-Box scope) rather than the full catalog. Mechanics only — no
 * setting-specific (Golarion) content.
 */

export interface Ancestry {
  id: string;
  name: string;
  blurb: string;
  hp: number;
  speed: number;
  boosts: Attr[]; // applied as one batch (distinct attributes)
  flaw?: Attr;
}

export interface Background {
  id: string;
  name: string;
  blurb: string;
  boosts: Attr[]; // one batch
  skill: string; // a trained skill it grants
}

export interface ClassFeat {
  id: string;
  name: string;
  desc: string;
}

export interface CharClass {
  id: string;
  name: string;
  blurb: string;
  keyAttr: Attr;
  hp: number;
  perception: ProficiencyRank;
  saves: { fort: ProficiencyRank; ref: ProficiencyRank; will: ProficiencyRank };
  classDcRank: ProficiencyRank;
  armor: { name: string; itemBonus: number; dexCap: number | null; rank: ProficiencyRank };
  weapon: { name: string; attr: Attr; rank: ProficiencyRank };
  /** Trained skills the learner chooses, on top of the background's one (plus Int). */
  trainedSkillChoices: number;
  spell?: { rank: ProficiencyRank; tradition: string };
  feats: ClassFeat[];
}

export const ANCESTRIES: Ancestry[] = [
  { id: "dwarf", name: "Dwarf", blurb: "Stout, steady, and hard to knock down.", hp: 10, speed: 20, boosts: ["con", "wis"], flaw: "cha" },
  { id: "elf", name: "Elf", blurb: "Quick, keen-eyed, and long-lived.", hp: 6, speed: 30, boosts: ["dex", "int"], flaw: "con" },
  { id: "halfling", name: "Halfling", blurb: "Small, nimble, and stubbornly lucky.", hp: 6, speed: 25, boosts: ["dex", "wis"], flaw: "str" },
  { id: "goblin", name: "Goblin", blurb: "Fast, fearless, and full of bad ideas.", hp: 6, speed: 25, boosts: ["dex", "cha"], flaw: "wis" },
];

export const BACKGROUNDS: Background[] = [
  { id: "acolyte", name: "Acolyte", blurb: "Raised in a quiet temple.", boosts: ["int", "wis"], skill: "religion" },
  { id: "scout", name: "Scout", blurb: "You learned the wilds the hard way.", boosts: ["dex", "wis"], skill: "survival" },
  { id: "urchin", name: "Street Urchin", blurb: "You grew up quick-fingered and quicker-footed.", boosts: ["dex", "int"], skill: "thievery" },
  { id: "laborer", name: "Laborer", blurb: "Long days built real strength.", boosts: ["str", "con"], skill: "athletics" },
];

export const CLASSES: CharClass[] = [
  {
    id: "fighter",
    name: "Fighter",
    blurb: "The master of arms. Hits hardest and most reliably.",
    keyAttr: "str",
    hp: 10,
    perception: "expert",
    saves: { fort: "expert", ref: "expert", will: "trained" },
    classDcRank: "trained",
    armor: { name: "Scale mail", itemBonus: 3, dexCap: 2, rank: "trained" },
    weapon: { name: "Longsword", attr: "str", rank: "expert" },
    trainedSkillChoices: 3,
    feats: [
      { id: "power-attack", name: "Power Attack", desc: "Spend 2 actions for one mighty swing with extra damage." },
      { id: "sudden-charge", name: "Sudden Charge", desc: "Stride twice and Strike — close the gap and hit." },
      { id: "reactive-shield", name: "Reactive Shield", desc: "Raise a shield as a reaction when you'd be hit." },
    ],
  },
  {
    id: "rogue",
    name: "Rogue",
    blurb: "Skills, speed, and devastating sneak attacks.",
    keyAttr: "dex",
    hp: 8,
    perception: "expert",
    saves: { fort: "trained", ref: "expert", will: "expert" },
    classDcRank: "trained",
    armor: { name: "Leather", itemBonus: 1, dexCap: 4, rank: "trained" },
    weapon: { name: "Rapier", attr: "dex", rank: "trained" },
    trainedSkillChoices: 6,
    feats: [
      { id: "nimble-dodge", name: "Nimble Dodge", desc: "Reaction: gain +2 AC against one attack." },
      { id: "twin-feint", name: "Twin Feint", desc: "Two strikes that leave the foe Off-Guard to the second." },
      { id: "youre-next", name: "You're Next", desc: "Drop a foe, then Demoralize another for free." },
    ],
  },
  {
    id: "cleric",
    name: "Cleric",
    blurb: "Divine spellcaster, healer, and battlefield support.",
    keyAttr: "wis",
    hp: 8,
    perception: "trained",
    saves: { fort: "trained", ref: "trained", will: "expert" },
    classDcRank: "trained",
    armor: { name: "Chain shirt", itemBonus: 2, dexCap: 3, rank: "trained" },
    weapon: { name: "Mace", attr: "str", rank: "trained" },
    trainedSkillChoices: 2,
    spell: { rank: "trained", tradition: "divine" },
    feats: [
      { id: "healing-font", name: "Healing Font", desc: "Extra prepared heal spells each day." },
      { id: "warpriest", name: "Warpriest Doctrine", desc: "Tougher armor and weapons for front-line clerics." },
      { id: "domain", name: "Domain Initiate", desc: "Gain a focus spell from your deity's domain." },
    ],
  },
  {
    id: "wizard",
    name: "Wizard",
    blurb: "Arcane spellcaster with the broadest spell list.",
    keyAttr: "int",
    hp: 6,
    perception: "trained",
    saves: { fort: "trained", ref: "trained", will: "expert" },
    classDcRank: "trained",
    armor: { name: "Unarmored", itemBonus: 0, dexCap: null, rank: "trained" },
    weapon: { name: "Staff", attr: "str", rank: "trained" },
    trainedSkillChoices: 2,
    spell: { rank: "trained", tradition: "arcane" },
    feats: [
      { id: "familiar", name: "Familiar", desc: "A magical animal companion that aids your magic." },
      { id: "school", name: "Arcane School", desc: "Specialize, gaining an extra spell and a focus spell." },
      { id: "reach-spell", name: "Reach Spell", desc: "Extend a spell's range with an extra action." },
    ],
  },
];

/** The 16 core skills with their key attribute. */
export const SKILLS: { key: string; name: string; attr: Attr }[] = [
  { key: "acrobatics", name: "Acrobatics", attr: "dex" },
  { key: "arcana", name: "Arcana", attr: "int" },
  { key: "athletics", name: "Athletics", attr: "str" },
  { key: "crafting", name: "Crafting", attr: "int" },
  { key: "deception", name: "Deception", attr: "cha" },
  { key: "diplomacy", name: "Diplomacy", attr: "cha" },
  { key: "intimidation", name: "Intimidation", attr: "cha" },
  { key: "medicine", name: "Medicine", attr: "wis" },
  { key: "nature", name: "Nature", attr: "wis" },
  { key: "occultism", name: "Occultism", attr: "int" },
  { key: "performance", name: "Performance", attr: "cha" },
  { key: "religion", name: "Religion", attr: "wis" },
  { key: "society", name: "Society", attr: "int" },
  { key: "stealth", name: "Stealth", attr: "dex" },
  { key: "survival", name: "Survival", attr: "wis" },
  { key: "thievery", name: "Thievery", attr: "dex" },
];

export const byId = <T extends { id: string }>(arr: T[], id: string | undefined): T | undefined =>
  arr.find((x) => x.id === id);
