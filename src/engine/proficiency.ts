import type { ProficiencyRank } from "./types";

export const RANK_VALUE: Record<ProficiencyRank, number> = {
  untrained: 0,
  trained: 2,
  expert: 4,
  master: 6,
  legendary: 8,
};

/**
 * Proficiency bonus = rank value + character level — but only if trained or
 * better. Untrained always contributes 0 (you never add your level when
 * untrained). The "Proficiency Without Level" variant drops the level term.
 */
export function proficiencyBonus(
  rank: ProficiencyRank,
  level: number,
  proficiencyWithoutLevel = false,
): number {
  if (rank === "untrained") return 0;
  return RANK_VALUE[rank] + (proficiencyWithoutLevel ? 0 : level);
}
