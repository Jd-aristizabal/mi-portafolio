import { readLocal, writeLocal } from './storage';
import { scoreService } from './scoreService';
import type { GameID, NamedScore } from '../types/arcade';
import type { GameResult, Score } from '../types';
import { arcadeGames } from '../data/arcade';
const HISTORY_KEY = 'portfolio:arcade-scores:v1';
const NAME_KEY = 'portfolio:player-name';
export function normalizePlayerName(value: string) { return value.trim().replace(/\s+/g, ' ').slice(0, 24); }
function history(): NamedScore[] {
  const value = readLocal(HISTORY_KEY);
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is NamedScore => !!item && typeof item === 'object' &&
    typeof item.game === 'string' && Object.hasOwn(arcadeGames, item.game) && typeof item.id === 'string' &&
    typeof item.name === 'string' && normalizePlayerName(item.name).length >= 2 &&
    Number.isSafeInteger(item.score) && item.score >= 0 && typeof item.createdAt === 'string');
}
export const arcadeScoreService = {
  playerName() { const name = readLocal(NAME_KEY); return typeof name === 'string' ? normalizePlayerName(name) : ''; },
  history(game: GameID) { return history().filter(item => item.game === game).slice(0, 10); },
  best(game: GameID) { return Math.max(0, ...history().filter(item => item.game === game).map(item => item.score)); },
  async summary(game: GameID) {
    let best = this.best(game);
    const records = this.history(game);
    let community: Score[] = [], error = '';
    if (game === 'pixel-sprint') {
      const responses = await Promise.allSettled([scoreService.best(), scoreService.leaderboard()]);
      if (responses[0].status === 'fulfilled') best = Math.max(best, responses[0].value);
      if (responses[1].status === 'fulfilled') community = responses[1].value;
      else error = 'El ranking no está disponible ahora. Tus partidas siguen aquí.';
    }
    return { best, history:records, community, error };
  },
  async record(game: GameID, result: GameResult, playerName: string) {
    const name = normalizePlayerName(playerName);
    if (name.length < 2) throw new Error('Escribe un nombre de al menos 2 caracteres.');
    if (!Number.isSafeInteger(result.score) || result.score < 0) throw new Error('La puntuación no es válida.');
    const entry: NamedScore = { ...result, id: crypto.randomUUID(), name, game, createdAt: new Date().toISOString() };
    const all = [entry, ...history()];
    const recent = all.slice(0, 147);
    const champions = Object.keys(arcadeGames).flatMap(id => {
      const entries = all.filter(row => row.game === id);
      if (!entries.length) return [];
      const best = entries.reduce((a,b) => a.score >= b.score ? a : b);
      return recent.some(row => row.id === best.id) ? [] : [best];
    });
    try { writeLocal(HISTORY_KEY, [...recent, ...champions]); }
    catch { throw new Error('No se pudo guardar en este navegador. Permite el almacenamiento y vuelve a intentar.'); }
    try { writeLocal(NAME_KEY, name); } catch { /* La partida ya está guardada. */ }
    // La API actual publica puntuaciones de Pixel Sprint. Los nuevos juegos
    // conservan un repositorio independiente hasta disponer de su contrato.
    let remoteError = '';
    if (game === 'pixel-sprint') {
      try { await scoreService.record(result); }
      catch (error) { remoteError = error instanceof Error ? error.message : 'No se pudo enviar la puntuación.'; }
    }
    return { entry, remoteError };
  }
};
