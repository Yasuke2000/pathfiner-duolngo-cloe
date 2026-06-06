import { multipleAttackPenalty } from "@/engine/actions";
import { resolveCheck } from "@/engine/check";
import { rollD20, rollDie } from "@/engine/dice";
import type { CheckResult } from "@/engine/types";
import type { Hero } from "./hero";

/** Authored definition of the tutorial opponent (lives in course content). */
export interface EnemyConfig {
  name: string;
  blurb: string;
  ac: number;
  maxHp: number;
  attackBonus: number;
  attackDamageDie: number;
  attackDamageBonus: number;
  /** DC the hero's Demoralize must meet to frighten this foe. */
  willDC: number;
}

export interface EnemyState extends EnemyConfig {
  hp: number;
  frightened: number;
  /** Temporarily immune to your Demoralize (PF2e: 10 minutes). */
  demoralizeImmune: boolean;
}

export function spawnEnemy(cfg: EnemyConfig): EnemyState {
  return { ...cfg, hp: cfg.maxHp, frightened: 0, demoralizeImmune: false };
}

/** Damage from a hit; a critical success doubles the rolled total. */
function weaponDamage(die: number, bonus: number, crit: boolean): number {
  const base = rollDie(die) + bonus;
  return crit ? base * 2 : base;
}

export interface StrikeOutcome {
  result: CheckResult;
  /** The MAP applied to this particular Strike. */
  map: number;
  /** Effective AC after the foe's frightened penalty. */
  targetAc: number;
  damage: number;
}

/**
 * The hero Strikes. `priorAttacks` drives the Multiple Attack Penalty; a
 * frightened foe's AC is lowered (frightened is a penalty to its DCs, and AC is
 * a DC) — so debuffing first makes every later swing land more often.
 */
export function heroStrike(
  hero: Hero,
  enemy: EnemyState,
  priorAttacks: number,
): StrikeOutcome {
  const map = multipleAttackPenalty(priorAttacks, hero.combat.agile);
  const die = rollD20();
  const total = die + hero.combat.strikeBonus + map;
  const targetAc = enemy.ac - enemy.frightened;
  const result = resolveCheck(die, total, targetAc);

  let damage = 0;
  if (result.degree === "success") {
    damage = weaponDamage(hero.combat.strikeDamageDie, hero.combat.strikeDamageBonus, false);
  } else if (result.degree === "critical-success") {
    damage = weaponDamage(hero.combat.strikeDamageDie, hero.combat.strikeDamageBonus, true);
  }
  return { result, map, targetAc, damage };
}

export interface DemoralizeOutcome {
  result: CheckResult;
  /** Frightened value inflicted (0 on a miss). Demoralize has no attack trait. */
  frightened: number;
}

export function heroDemoralize(hero: Hero, enemy: EnemyState): DemoralizeOutcome {
  const die = rollD20();
  const total = die + hero.combat.intimidationBonus;
  // vs Will DC (not an attack); frightened lowers the foe's DCs, Will included.
  const result = resolveCheck(die, total, enemy.willDC - enemy.frightened);
  let frightened = 0;
  if (result.degree === "critical-success") frightened = 2;
  else if (result.degree === "success") frightened = 1;
  return { result, frightened };
}

export interface EnemyAttackOutcome {
  result: CheckResult;
  targetAc: number;
  damage: number;
}

/** The foe Strikes the hero; a raised shield adds +2 circumstance AC. */
export function enemyStrike(
  hero: Hero,
  enemy: EnemyState,
  shieldRaised: boolean,
): EnemyAttackOutcome {
  const die = rollD20();
  // Frightened also weakens the foe's own attack rolls.
  const total = die + enemy.attackBonus - enemy.frightened;
  const targetAc = hero.combat.ac + (shieldRaised ? 2 : 0);
  const result = resolveCheck(die, total, targetAc);

  let damage = 0;
  if (result.degree === "success") {
    damage = weaponDamage(enemy.attackDamageDie, enemy.attackDamageBonus, false);
  } else if (result.degree === "critical-success") {
    damage = weaponDamage(enemy.attackDamageDie, enemy.attackDamageBonus, true);
  }
  return { result, targetAc, damage };
}
