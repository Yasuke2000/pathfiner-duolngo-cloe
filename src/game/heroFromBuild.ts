import { proficiencyBonus } from "@/engine/proficiency";
import { buildAttrs, derived, resolve, trainedSkills, type BuildState } from "./builder";
import { PREGEN_HERO, type Hero } from "./hero";

// Base weapon damage die per class (matches CLASS data flavor).
const WEAPON_DIE: Record<string, number> = { fighter: 8, rogue: 6, cleric: 6, wizard: 4 };

/**
 * Convert a player-built character into the combat Hero shape so their OWN
 * stats (AC, HP, attack, attributes) drive the capstone fight — unifying the
 * "build a hero" and "play a hero" halves of the course.
 */
export function combatHeroFromBuild(b: BuildState): Hero {
  const { cls } = resolve(b);
  const attrs = buildAttrs(b);
  const stats = derived(b);
  if (!cls || !stats) return PREGEN_HERO;

  const trainedIntim = trainedSkills(b).includes("intimidation");
  return {
    name: b.name.trim() || "your hero",
    archetype: cls.name,
    level: 1,
    attrs,
    skills: { athletics: "trained", acrobatics: "trained" },
    combat: {
      ac: stats.ac,
      maxHp: stats.hp,
      strikeBonus: stats.attack,
      strikeDamageDie: WEAPON_DIE[cls.id] ?? 6,
      strikeDamageBonus: attrs[cls.weapon.attr],
      agile: false,
      intimidationBonus: attrs.cha + proficiencyBonus(trainedIntim ? "trained" : "untrained", 1),
    },
  };
}
