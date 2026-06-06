import type { Degree } from "@/engine/types";

export interface DegreeTheme {
  label: string;
  /** A non-color cue (icon/symbol) so meaning never relies on color alone. */
  symbol: string;
  /** CSS color variable name used in globals.css. */
  varName: string;
}

export const DEGREE_THEME: Record<Degree, DegreeTheme> = {
  "critical-success": { label: "Critical Success", symbol: "★", varName: "--crit-success" },
  success: { label: "Success", symbol: "✓", varName: "--success" },
  failure: { label: "Failure", symbol: "✕", varName: "--failure" },
  "critical-failure": { label: "Critical Failure", symbol: "‼", varName: "--crit-failure" },
};

export const DEGREE_ORDER: Degree[] = [
  "critical-failure",
  "failure",
  "success",
  "critical-success",
];
