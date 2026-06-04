// Core type vocabulary for the Pathfinder 2e (Remaster) rules engine.
// Kept deliberately small and framework-agnostic so it can be unit-tested in
// isolation and reused everywhere (checks, saves, skills, attacks, ...).

export type ProficiencyRank =
  | "untrained"
  | "trained"
  | "expert"
  | "master"
  | "legendary";

export type Attr = "str" | "dex" | "con" | "int" | "wis" | "cha";

/**
 * PF2e's typed-bonus system: you only ever benefit from the single highest
 * bonus of each named type, and suffer only the single worst penalty of each
 * type — but a bonus AND a penalty of the same type both apply. "untyped"
 * values (MAP, range, ...) are the exception: they all stack.
 */
export type BonusType = "circumstance" | "status" | "item" | "untyped";

export type Degree =
  | "critical-success"
  | "success"
  | "failure"
  | "critical-failure";

export interface Modifier {
  type: BonusType;
  value: number;
  source: string;
  /** Defaults to true. Set false to model a temporarily-suppressed modifier. */
  enabled?: boolean;
}

export interface CheckResult {
  /** The raw d20 face (1-20). */
  die: number;
  /** Total of die + all surviving modifiers. */
  total: number;
  dc: number;
  degree: Degree;
  /** The degree implied purely by the numbers, before the nat-20/nat-1 step. */
  baseDegree: Degree;
  /** Whether the natural die bumped the degree up/down, or null if unchanged. */
  shifted: "up" | "down" | null;
}
