import type { Modifier } from "./types";

/**
 * Multiple Attack Penalty (MAP) for the CURRENT attack, given how many
 * attack-trait actions you have already taken this turn.
 *
 * Untyped, so it stacks with everything; computed from the weapon used for the
 * current attack; applies only on your own turn; resets at the start of it.
 * Agile weapons soften it to -4 / -8.
 */
export function multipleAttackPenalty(priorAttacks: number, agile = false): number {
  if (priorAttacks <= 0) return 0;
  if (priorAttacks === 1) return agile ? -4 : -5;
  return agile ? -8 : -10;
}

/** The MAP expressed as an engine Modifier, ready to drop into a check. */
export function mapModifier(priorAttacks: number, agile = false): Modifier {
  return {
    type: "untyped",
    value: multipleAttackPenalty(priorAttacks, agile),
    source: "multiple attack penalty",
  };
}

export interface TurnState {
  actionsRemaining: number;
  reactionAvailable: boolean;
  attacksThisTurn: number;
}

/**
 * Actions available at the start of a turn. Conditions that change the action
 * count apply here (slowed/stunned remove the GREATER of the two — they don't
 * add; quickened grants one restricted extra action).
 */
export function startTurn(
  { base = 3, slowed = 0, stunned = 0, quickened = false } = {},
): TurnState {
  const lost = Math.max(slowed, stunned);
  return {
    actionsRemaining: Math.max(0, base + (quickened ? 1 : 0) - lost),
    reactionAvailable: true,
    attacksThisTurn: 0,
  };
}

/** Spend `cost` actions; increment the attack counter if the action attacks. */
export function spendAction(
  t: TurnState,
  cost: number,
  hasAttackTrait = false,
): TurnState {
  if (cost > t.actionsRemaining) {
    throw new Error("Not enough actions remaining");
  }
  return {
    ...t,
    actionsRemaining: t.actionsRemaining - cost,
    attacksThisTurn: t.attacksThisTurn + (hasAttackTrait ? 1 : 0),
  };
}
