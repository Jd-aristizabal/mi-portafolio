export function memoryDeck(random = Math.random) {
  const cards = Array.from({ length: 12 }, (_, id) => ({ id, symbol: Math.floor(id / 2) }));
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  return cards;
}
export function angleDistance(a: number, b: number) { return Math.abs(((a - b + 540) % 360) - 180); }
export function pulsePoints(distance: number, combo: number) {
  if (distance > 16) return 0;
  return (distance <= 5 ? 200 : 100) * Math.min(4, 1 + Math.floor(combo / 4));
}
