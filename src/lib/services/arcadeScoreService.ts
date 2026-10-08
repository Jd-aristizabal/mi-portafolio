import { readLocal, writeLocal } from './storage';
import { api, errorMessage } from './api';
import type { GameID, NamedScore } from '../types/arcade';
import type { GameResult, Score } from '../types';
const NAME_KEY = 'portfolio:player-name';
const LEGACY_KEY = 'portfolio:arcade-scores:v1';
let importing = false, nextImport = 0;
type SavedScore = GameResult & { id: string; player_name: string | null; created_at: string };
const cache = new Map<GameID, { best: number; history: NamedScore[] }>();
export function normalizePlayerName(value: string) { return value.trim().replace(/\s+/g, ' ').slice(0, 24); }
function named(game: GameID, row: SavedScore): NamedScore {
  return { ...row, game, name: row.player_name || 'Anónimo', createdAt: row.created_at };
}
async function importPreviousScores(): Promise<string> {
  if (importing || Date.now() < nextImport) return '';
  const stored = readLocal(LEGACY_KEY);
  if (!Array.isArray(stored) || !stored.length) return '';
  importing = true;
  nextImport = Date.now() + 65000;
  let error = '';
  try {
    const candidates = [...stored].reverse().filter((row): row is NamedScore => row &&
      ['pixel-sprint', 'orbit-match', 'pulse-orbit'].includes(row.game) &&
      typeof row.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id) &&
      typeof row.name === 'string' && normalizePlayerName(row.name).length >= 2 &&
      [row.score, row.max_combo, row.level, row.duration_seconds].every(Number.isSafeInteger)).slice(0, 2);
    for (const row of candidates) {
      try {
        await api(`/games/${row.game}/scores`, 'POST', { score: row.score, max_combo: row.max_combo,
          level: row.level, duration_seconds: row.duration_seconds, player_name: normalizePlayerName(row.name), submission_id: row.id });
        const latest = readLocal(LEGACY_KEY);
        if (Array.isArray(latest)) writeLocal(LEGACY_KEY, latest.filter(item => item?.id !== row.id));
      } catch (cause) {
        error = `Una partida anterior sigue pendiente de importar: ${errorMessage(cause)}`;
        break;
      }
    }
  } finally { importing = false; }
  return error;
}
export const arcadeScoreService = {
  playerName() { const name = readLocal(NAME_KEY); return typeof name === 'string' ? normalizePlayerName(name) : ''; },
  history(game: GameID) { return cache.get(game)?.history || []; },
  best(game: GameID) { return cache.get(game)?.best || 0; },
  async summary(game: GameID) {
    const importError = await importPreviousScores();
    const responses = await Promise.allSettled([
      api<{ best_score: number; scores: SavedScore[] }>(`/games/${game}/me?limit=10`),
      api<SavedScore[]>(`/games/${game}/leaderboard`, 'GET', undefined, false)
    ]);
    let best = 0, history: NamedScore[] = [], community: Score[] = [], error = importError;
    if (responses[0].status === 'fulfilled') {
      best = responses[0].value.best_score;
      history = responses[0].value.scores.map(row => named(game, row));
      cache.set(game, { best, history });
    } else error = errorMessage(responses[0].reason);
    if (responses[1].status === 'fulfilled') community = responses[1].value.map(row => ({ name: row.player_name || 'Anónimo', score: row.score }));
    else error = errorMessage(responses[1].reason);
    return { best, history, community, error };
  },
  async record(game: GameID, result: GameResult, playerName: string, submissionID: string = crypto.randomUUID()) {
    const name = normalizePlayerName(playerName);
    if (name.length < 2) throw new Error('Escribe un nombre de al menos 2 caracteres.');
    if (!Number.isSafeInteger(result.score) || result.score < 0) throw new Error('La puntuación no es válida.');
    const saved = await api<SavedScore>(`/games/${game}/scores`, 'POST', { ...result, player_name: name, submission_id: submissionID });
    const entry = named(game, saved);
    const previous = cache.get(game);
    cache.set(game, { best: Math.max(previous?.best || 0, entry.score), history: [entry, ...(previous?.history || []).filter(row => row.id !== entry.id)].slice(0, 10) });
    try { writeLocal(NAME_KEY, name); } catch { /* El servidor ya confirmó la partida. */ }
    return { entry };
  }
};
