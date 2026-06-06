import { resolveCheck } from "./check";
import type { Degree } from "./types";

export interface DyingState {
  dying: number;
  wounded: number;
  doomed: number;
}

/** You die when your dying value reaches 4 − doomed. */
export function deathThreshold(doomed: number): number {
  return 4 - doomed;
}

/**
 * Dying value gained on being knocked to 0 HP: base 1 (or 2 from a critical
 * hit / critical-failed save), plus your current wounded value. This is why
 * wounded is the silent killer — each knockout gets worse.
 */
export function dyingOnKnockout(wounded: number, fromCritOrCritFailSave = false): number {
  const base = fromCritOrCritFailSave ? 2 : 1;
  return Math.min(4, base + wounded);
}

export interface RecoveryResult {
  state: DyingState;
  die: number;
  dc: number;
  degree: Degree;
  stabilized: boolean;
  dead: boolean;
}

/**
 * A recovery check is a FLAT check (no modifiers): d20 vs DC 10 + dying value,
 * resolved into the four degrees (natural 20/1 still shift a step).
 *
 * Remaster outcomes:
 *  - crit success: dying −2
 *  - success:      dying −1
 *  - failure:      dying += 1 + wounded   (more lethal than legacy's flat +1)
 *  - crit failure: dying += 2 + wounded
 *
 * Losing the dying condition (reaching 0) raises wounded by 1.
 */
export function recoveryCheck(state: DyingState, die: number): RecoveryResult {
  const dc = 10 + state.dying;
  const { degree } = resolveCheck(die, die, dc); // flat check: total === die

  let dying = state.dying;
  let wounded = state.wounded;

  if (degree === "critical-success") dying -= 2;
  else if (degree === "success") dying -= 1;
  else if (degree === "failure") dying += 1 + wounded;
  else dying += 2 + wounded;

  let stabilized = false;
  let dead = false;

  if (dying <= 0) {
    dying = 0;
    wounded += 1;
    stabilized = true;
  } else if (dying >= deathThreshold(state.doomed)) {
    dead = true;
  }

  return {
    state: { dying, wounded, doomed: state.doomed },
    die,
    dc,
    degree,
    stabilized,
    dead,
  };
}
