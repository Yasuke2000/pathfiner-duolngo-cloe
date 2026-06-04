/** Roll a single die with the given number of sides (default d20). */
export function rollDie(sides = 20): number {
  return Math.floor(Math.random() * sides) + 1;
}

export const rollD20 = (): number => rollDie(20);
