import type { BonusType, Modifier } from "./types";

export interface StackItem {
  source: string;
  type: BonusType;
  value: number;
  /** True if this modifier was overruled by a same-type bonus/penalty. */
  dropped: boolean;
}

const TYPED: readonly BonusType[] = ["circumstance", "status", "item"];

/**
 * The core stacking reducer, returning a per-modifier breakdown so the UI can
 * literally show learners which bonuses were kept and which were dropped — that
 * breakdown IS the tutorial.
 *
 * Rule: for each typed category keep the single highest bonus and the single
 * worst penalty (both can apply together). Untyped modifiers all stack.
 */
export function stackingBreakdown(mods: Modifier[]): {
  total: number;
  items: StackItem[];
} {
  const active = mods.filter((m) => m.enabled !== false);
  const items: StackItem[] = [];
  let total = 0;

  for (const type of TYPED) {
    const ofType = active.filter((m) => m.type === type);
    const bonuses = ofType.filter((m) => m.value > 0).map((m) => m.value);
    const penalties = ofType.filter((m) => m.value < 0).map((m) => m.value);
    const bestBonus = bonuses.length ? Math.max(...bonuses) : 0;
    const worstPen = penalties.length ? Math.min(...penalties) : 0;

    let bonusTaken = false;
    let penTaken = false;
    for (const m of ofType) {
      let dropped = false;
      if (m.value > 0) {
        if (!bonusTaken && m.value === bestBonus) bonusTaken = true;
        else dropped = true;
      } else if (m.value < 0) {
        if (!penTaken && m.value === worstPen) penTaken = true;
        else dropped = true;
      }
      items.push({ source: m.source, type, value: m.value, dropped });
    }
    total += bestBonus + worstPen;
  }

  for (const m of active.filter((m) => m.type === "untyped")) {
    items.push({ source: m.source, type: "untyped", value: m.value, dropped: false });
    total += m.value;
  }

  return { total, items };
}

/** Convenience wrapper when you only need the summed modifier total. */
export function applyStacking(mods: Modifier[]): number {
  return stackingBreakdown(mods).total;
}
