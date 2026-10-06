export const gameRules = { durationSeconds: 30, maxMultiplier: 5, hitsPerCombo: 5, hitsPerLevel: 7, maxLevel: 8 };
export const multiplierFor = (combo: number) => Math.min(gameRules.maxMultiplier, 1 + Math.floor(combo / gameRules.hitsPerCombo));
export const levelFor = (hits: number) => Math.min(gameRules.maxLevel, 1 + Math.floor(hits / gameRules.hitsPerLevel));
export const targetDurationFor = (hits: number) => Math.max(450, 1550 - (levelFor(hits) - 1) * 150);
export function chooseTarget(previous: number, random: () => number = Math.random): number {
  const choices = Array.from({ length: 9 }, (_, i) => i).filter(i => i !== previous);
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}
