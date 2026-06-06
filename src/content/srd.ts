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

// ---------------------------------------------------------------------------
// Deeper character options: heritages, ancestry feats, languages, spells, gear
// ---------------------------------------------------------------------------

export interface Heritage {
  id: string;
  name: string;
  blurb: string;
}

export interface Spell {
  id: string;
  name: string;
  desc: string;
  /** If present, this cantrip can be cast offensively in combat. */
  combat?: {
    kind: "attack" | "save";
    save?: "reflex" | "will" | "fortitude";
    /** Damage die size (e.g. 4 = d4); the key attribute modifier is added. */
    die: number;
  };
}

export const HERITAGES: Record<string, Heritage[]> = {
  dwarf: [
    { id: "rock", name: "Rock Dwarf", blurb: "Hard to move; resist being shoved or tripped." },
    { id: "forge", name: "Forge Dwarf", blurb: "Raised by the forge; resist fire and heat." },
    { id: "ancient", name: "Ancient-Blooded", blurb: "Old bloodline; a reaction that resists magic." },
  ],
  elf: [
    { id: "cavern", name: "Cavern Elf", blurb: "Darkvision from a life underground." },
    { id: "woodland", name: "Woodland Elf", blurb: "Climb and hide in forests with ease." },
    { id: "whisper", name: "Whisper Elf", blurb: "Sharper hearing; pinpoint sounds." },
  ],
  halfling: [
    { id: "gutsy", name: "Gutsy Halfling", blurb: "Shrug off fear with a stiff upper lip." },
    { id: "nomadic", name: "Nomadic Halfling", blurb: "A wanderer who picks up extra languages." },
    { id: "twilight", name: "Twilight Halfling", blurb: "Low-light vision from dusk travels." },
  ],
  goblin: [
    { id: "charhide", name: "Charhide Goblin", blurb: "Singed hide; resist fire and recover from burns." },
    { id: "razortooth", name: "Razortooth Goblin", blurb: "Wicked teeth make a real bite attack." },
    { id: "unbreakable", name: "Unbreakable Goblin", blurb: "Extra hit points and softer falls." },
  ],
};

export const ANCESTRY_FEATS: Record<string, ClassFeat[]> = {
  dwarf: [
    { id: "d-lore", name: "Dwarven Lore", desc: "Trained in Crafting & Religion, and Dwarven Lore." },
    { id: "d-weapon", name: "Dwarven Weapon Familiarity", desc: "Treat dwarven weapons (like the war axe) as one rank simpler." },
    { id: "rock-runner", name: "Rock Runner", desc: "Move over rubble and stone with no penalty." },
  ],
  elf: [
    { id: "e-lore", name: "Elven Lore", desc: "Trained in Arcana & Nature, and Elven Lore." },
    { id: "nimble", name: "Nimble Elf", desc: "Your Speed increases by 5 feet." },
    { id: "otherworldly", name: "Otherworldly Magic", desc: "Gain a cantrip from your elven heritage." },
  ],
  halfling: [
    { id: "h-lore", name: "Halfling Lore", desc: "Trained in Acrobatics & Stealth, and Halfling Lore." },
    { id: "distracting", name: "Distracting Shadows", desc: "Use larger creatures as cover to Hide." },
    { id: "sure-feet", name: "Sure Feet", desc: "Stay upright; failures to Balance/Climb aren't worse." },
  ],
  goblin: [
    { id: "g-lore", name: "Goblin Lore", desc: "Trained in Nature & Stealth, and Goblin Lore." },
    { id: "burn-it", name: "Burn It!", desc: "Your fire spells and alchemy hit harder." },
    { id: "very-sneaky", name: "Very Sneaky", desc: "Sneak farther, and stay hidden as you move." },
  ],
};

/** Languages each ancestry grants for free (Common plus their own). */
export const ANCESTRY_LANGUAGES: Record<string, string[]> = {
  dwarf: ["Common", "Dwarven"],
  elf: ["Common", "Elven"],
  halfling: ["Common", "Halfling"],
  goblin: ["Common", "Goblin"],
};

export const LANGUAGE_POOL = [
  "Draconic", "Dwarven", "Elven", "Gnomish", "Goblin", "Halfling", "Jotun", "Orcish", "Sylvan", "Undercommon",
];

export interface SpellcastingDef {
  tradition: string;
  cantripsKnown: number;
  spellsKnown: number;
  cantrips: Spell[];
  spells: Spell[];
}

export const CLASS_SPELLS: Record<string, SpellcastingDef> = {
  cleric: {
    tradition: "divine",
    cantripsKnown: 4,
    spellsKnown: 2,
    cantrips: [
      { id: "divine-lance", name: "Divine Lance", desc: "A ranged spell attack of divine energy.", combat: { kind: "attack", die: 4 } },
      { id: "guidance", name: "Guidance", desc: "Grant an ally a small bonus to one roll." },
      { id: "light", name: "Light", desc: "Make an object glow like a torch." },
      { id: "stabilize", name: "Stabilize", desc: "Stop a dying creature from getting worse." },
      { id: "shield-cantrip", name: "Shield", desc: "A reaction: raise a magical shield." },
      { id: "daze", name: "Daze", desc: "Mental damage; basic Will save.", combat: { kind: "save", save: "will", die: 4 } },
    ],
    spells: [
      { id: "heal", name: "Heal", desc: "Restore hit points (the cleric's signature)." },
      { id: "bless", name: "Bless", desc: "An aura that buffs allies' attacks." },
      { id: "fear", name: "Fear", desc: "Frighten a foe." },
      { id: "sanctuary", name: "Sanctuary", desc: "Ward a creature from being attacked." },
    ],
  },
  wizard: {
    tradition: "arcane",
    cantripsKnown: 5,
    spellsKnown: 2,
    cantrips: [
      { id: "electric-arc", name: "Electric Arc", desc: "Lightning; basic Reflex save.", combat: { kind: "save", save: "reflex", die: 4 } },
      { id: "ray-of-frost", name: "Ray of Frost", desc: "A cold ranged spell attack.", combat: { kind: "attack", die: 4 } },
      { id: "light", name: "Light", desc: "Make an object glow like a torch." },
      { id: "detect-magic", name: "Detect Magic", desc: "Sense magic nearby." },
      { id: "shield-cantrip", name: "Shield", desc: "A reaction: raise a magical shield." },
      { id: "telekinetic", name: "Telekinetic Projectile", desc: "Hurl a loose object — spell attack.", combat: { kind: "attack", die: 6 } },
    ],
    spells: [
      { id: "magic-missile", name: "Magic Missile", desc: "Darts of force that never miss." },
      { id: "grease", name: "Grease", desc: "Make a surface slippery; foes fall." },
      { id: "fear", name: "Fear", desc: "Frighten a foe." },
      { id: "sleep", name: "Sleep", desc: "Send foes into a magical slumber." },
    ],
  },
};

/** A simple starting kit shown on the sheet (flavor + a sense of readiness). */
export const CLASS_GEAR: Record<string, string[]> = {
  fighter: ["Scale mail", "Longsword", "Steel shield", "Adventurer's pack", "15 gp"],
  rogue: ["Leather armor", "Rapier", "Dagger ×2", "Thieves' tools", "Adventurer's pack", "15 gp"],
  cleric: ["Chain shirt", "Mace", "Religious symbol", "Healer's tools", "Adventurer's pack", "15 gp"],
  wizard: ["Staff", "Dagger", "Spellbook", "Material component pouch", "Adventurer's pack", "15 gp"],
};

export const CLASS_GLYPH: Record<string, string> = {
  fighter: "⚔️",
  rogue: "🗡️",
  cleric: "✨",
  wizard: "🔮",
};
