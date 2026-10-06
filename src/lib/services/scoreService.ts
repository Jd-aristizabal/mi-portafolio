import type { ScoreRepository } from '../types';
import { mockLeaderboard } from '../data/mock';
import { readLocal, writeLocal } from './storage';
export const scoreService: ScoreRepository = {
  async best() { const value = readLocal('pixel-sprint:best'); return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0; },
  async record(score) { const best = Math.max(await this.best(), score); writeLocal('pixel-sprint:best', best); return best; },
  async leaderboard() { const best = await this.best(); return [...mockLeaderboard, ...(best > 0 ? [{ name: 'TÚ', score: best, local: true }] : [])].sort((a, b) => b.score - a.score); }
};
