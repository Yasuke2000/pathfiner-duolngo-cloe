import type { CheckResult, Degree } from "./types";

const STEP_TO_DEGREE = [
  "critical-failure",
  "failure",
  "success",
  "critical-success",
] as const;

const DEGREE_TO_STEP: Record<Degree, number> = {
  "critical-failure": 0,
  failure: 1,
  success: 2,
  "critical-success": 3,
};

/** The degree implied purely by the numbers, before the natural-die step. */
export function baseDegree(total: number, dc: number): Degree {
  if (total >= dc + 10) return "critical-success";
  if (total >= dc) return "success";
  if (total <= dc - 10) return "critical-failure";
  return "failure";
}

/**
 * Resolve a check into its four-degree outcome.
 *
 * Order matters: compute the numeric degree first, THEN apply the natural die
 * (nat 20 bumps one step up, nat 1 one step down). This is why a nat 20 against
 * a brutal DC can be "only a success", and a nat 1 with a huge modifier can
 * still be "merely a success".
 */
export function resolveCheck(die: number, total: number, dc: number): CheckResult {
  const base = baseDegree(total, dc);
  const before = DEGREE_TO_STEP[base];

  let step = before;
  if (die === 20) step = Math.min(3, step + 1);
  else if (die === 1) step = Math.max(0, step - 1);

  const shifted = step > before ? "up" : step < before ? "down" : null;

  return {
    die,
    total,
    dc,
    degree: STEP_TO_DEGREE[step],
    baseDegree: base,
    shifted,
  };
}
