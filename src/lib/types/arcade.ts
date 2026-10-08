import type { GameResult } from './index';
export type GameID = 'pixel-sprint' | 'orbit-match' | 'pulse-orbit';
export interface NamedScore extends GameResult { id: string; game: GameID; name: string; createdAt: string }
