import { multipleAttackPenalty } from "@/engine/actions";
import { resolveCheck } from "@/engine/check";
import { rollD20, rollDie } from "@/engine/dice";
import type { CheckResult } from "@/engine/types";

export type Role = "hero" | "ally" | "foe";

export interface Combatant {
  id: string;
  name: string;
  role: Role;
  ac: number;
  maxHp: number;
  hp: number;
  attackBonus: number;
  damageDie: number;
  damageBonus: number;
  athleticsBonus: number;
  intimidationBonus: number;
  willDC: number;
  reflexDC: number;
  initiativeBonus: number;
  /** Hardness subtracted from a hit when Shield Block is used. */
  shieldHardness: number;
  // mutable battle state
  initiative: number;
  frightened: number;
  offGuard: boolean;
  shieldRaised: boolean;
  reactionAvailable: boolean;
  /** Temporarily immune to this combatant's Demoralize (PF2e: 10 minutes). */
  demoralizeImmune: boolean;
  defeated: boolean;
}

export interface CombatantSeed
  extends Partial<Omit<Combatant, "id" | "name" | "role">> {
  id: string;
  name: string;
  role: Role;
}

/** Fill a partial seed with sane defaults so callers only specify what matters. */
export function makeCombatant(seed: CombatantSeed): Combatant {
  const maxHp = seed.maxHp ?? 20;
  return {
    ac: 15,
    maxHp,
    hp: seed.hp ?? maxHp,
    attackBonus: 0,
    damageDie: 6,
    damageBonus: 0,
    athleticsBonus: 0,
    intimidationBonus: 0,
    willDC: 15,
    reflexDC: 15,
    initiativeBonus: 0,
    shieldHardness: 0,
    initiative: 0,
    frightened: 0,
    offGuard: false,
    shieldRaised: false,
    reactionAvailable: true,
    demoralizeImmune: false,
    defeated: false,
    ...seed,
  };
}

/**
 * Effective AC after the situational levers this slice teaches:
 * a raised shield adds +2; being off-guard (e.g. tripped prone) is -2; and
 * frightened lowers all of a creature's DCs (AC included).
 */
export function effectiveAc(c: Combatant): number {
  return c.ac + (c.shieldRaised ? 2 : 0) - (c.offGuard ? 2 : 0) - c.frightened;
}

function damageRoll(die: number, bonus: number, crit: boolean): number {
  const base = rollDie(die) + bonus;
  return crit ? base * 2 : base;
}

export interface AttackOutcome {
  result: CheckResult;
  map: number;
  targetAc: number;
  damage: number;
}

export function makeStrike(
  attacker: Combatant,
  defender: Combatant,
  priorAttacks: number,
): AttackOutcome {
  const map = multipleAttackPenalty(priorAttacks);
  const die = rollD20();
  const total = die + attacker.attackBonus - attacker.frightened + map;
  const targetAc = effectiveAc(defender);
  const result = resolveCheck(die, total, targetAc);
  let damage = 0;
  if (result.degree === "success") damage = damageRoll(attacker.damageDie, attacker.damageBonus, false);
  else if (result.degree === "critical-success") damage = damageRoll(attacker.damageDie, attacker.damageBonus, true);
  return { result, map, targetAc, damage };
}

export interface DemoralizeOutcome {
  result: CheckResult;
  frightened: number;
}

export function makeDemoralize(attacker: Combatant, defender: Combatant): DemoralizeOutcome {
  const die = rollD20();
  // Demoralize is an Intimidation check vs the target's Will DC (not an attack
  // roll, so no MAP). Frightened lowers all of the target's DCs, Will included.
  const willDc = defender.willDC - defender.frightened;
  const result = resolveCheck(die, die + attacker.intimidationBonus, willDc);
  let frightened = 0;
  if (result.degree === "critical-success") frightened = 2;
  else if (result.degree === "success") frightened = 1;
  return { result, frightened };
}

export interface TripOutcome {
  result: CheckResult;
  proned: boolean;
}

/**
 * Trip: Athletics vs the target's Reflex DC. It has the ATTACK trait, so it's
 * subject to (and contributes to) the Multiple Attack Penalty. Frightened
 * lowers the target's Reflex DC too.
 */
export function makeTrip(attacker: Combatant, defender: Combatant, priorAttacks = 0): TripOutcome {
  const map = multipleAttackPenalty(priorAttacks);
  const die = rollD20();
  const reflexDc = defender.reflexDC - defender.frightened;
  const result = resolveCheck(die, die + attacker.athleticsBonus + map, reflexDc);
  const proned = result.degree === "success" || result.degree === "critical-success";
  return { result, proned };
}

// ---- Spellcasting (used by a built caster hero in the capstone) ----

export interface SpellProfile {
  attack: number;
  dc: number;
  /** Key-attribute modifier added to cantrip damage. */
  bonus: number;
}

/** A spell-attack cantrip (Ray of Frost, etc.): vs AC, has the attack trait (MAP). */
export function makeSpellAttack(
  caster: SpellProfile,
  defender: Combatant,
  die: number,
  priorAttacks: number,
): AttackOutcome {
  const map = multipleAttackPenalty(priorAttacks);
  const roll = rollD20();
  const total = roll + caster.attack + map;
  const targetAc = effectiveAc(defender);
  const result = resolveCheck(roll, total, targetAc);
  let damage = 0;
  if (result.degree === "success") damage = damageRoll(die, caster.bonus, false);
  else if (result.degree === "critical-success") damage = damageRoll(die, caster.bonus, true);
  return { result, map, targetAc, damage };
}

/** Basic-save damage: none / half / full / double by the target's save degree. */
export function basicSaveDamage(degree: CheckResult["degree"], full: number): number {
  if (degree === "critical-success") return 0;
  if (degree === "success") return Math.floor(full / 2);
  if (degree === "failure") return full;
  return full * 2; // critical failure
}

export interface SpellSaveOutcome {
  result: CheckResult; // the DEFENDER's save result
  dc: number;
  damage: number;
}

/** A basic-save cantrip (Electric Arc, etc.): the foe rolls a save vs your spell DC. */
export function makeSpellSave(
  caster: SpellProfile,
  defender: Combatant,
  die: number,
  save: "reflex" | "will" | "fortitude",
): SpellSaveOutcome {
  // We model defenses as DCs; the matching save modifier is DC − 10, minus the
  // frightened penalty (frightened lowers the creature's checks too).
  const dcField = save === "reflex" ? defender.reflexDC : defender.willDC; // (fortitude ~ will here)
  const saveMod = dcField - 10 - defender.frightened;
  const roll = rollD20();
  const result = resolveCheck(roll, roll + saveMod, caster.dc);
  const full = rollDie(die) + caster.bonus;
  return { result, dc: caster.dc, damage: basicSaveDamage(result.degree, full) };
}

/** Roll initiative for everyone and return the ids in turn order (desc). */
export function rollInitiative(combatants: Combatant[]): {
  combatants: Combatant[];
  order: string[];
} {
  const rolled = combatants.map((c) => ({
    ...c,
    initiative: rollD20() + c.initiativeBonus,
  }));
  const order = [...rolled]
    // Highest initiative first; on a tie the adversary goes first (PF2e RAW).
    .sort((a, b) => b.initiative - a.initiative || (a.role === "foe" ? -1 : 1))
    .map((c) => c.id);
  return { combatants: rolled, order };
}

export const rollLabel = (o: { result: CheckResult }, dcLabel: string): string =>
  `🎲 ${o.result.die} → ${o.result.total} vs ${dcLabel} ${o.result.dc}`;

import { PREGEN_HERO, type Hero } from "./hero";

/** Turn the pregenerated hero into a combatant for the encounter tracker. */
export function heroCombatant(hero: Hero = PREGEN_HERO): Combatant {
  return makeCombatant({
    id: "wren",
    name: hero.name,
    role: "hero",
    ac: hero.combat.ac,
    maxHp: hero.combat.maxHp,
    attackBonus: hero.combat.strikeBonus,
    damageDie: hero.combat.strikeDamageDie,
    damageBonus: hero.combat.strikeDamageBonus,
    intimidationBonus: hero.combat.intimidationBonus,
    initiativeBonus: 4,
    shieldHardness: 5, // a sturdy wooden shield blocks 5 damage
  });
}

/** The companion who fights alongside the learner and models good tactics. */
export const ALLY_BRAM = (): Combatant =>
  makeCombatant({
    id: "bram",
    name: "Tahar",
    role: "ally",
    ac: 18,
    maxHp: 26,
    attackBonus: 9,
    damageDie: 8,
    damageBonus: 4,
    athleticsBonus: 9,
    initiativeBonus: 5,
  });
