import type { ScoreRepository } from '../types';
import { api } from './api';
export const scoreService: ScoreRepository = {
  async best() { const result = await api<{ best_score: number }>('/games/pixel-sprint/me'); return result.best_score; },
  async record(result) { await api('/games/pixel-sprint/scores', 'POST', result); return this.best(); },
  async leaderboard() { const rows = await api<{ player_name: string | null; score: number }[]>('/games/pixel-sprint/leaderboard', 'GET', undefined, false); return rows.map(row => ({ name: row.player_name || 'Anónimo', score: row.score })); }
};
