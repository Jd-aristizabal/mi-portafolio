import type { GameID } from '../types/arcade';
export const arcadeGames: Record<GameID, { title: string; duration: number; color: string }> = {
  'pixel-sprint': { title: 'Pixel Sprint', duration: 30, color: '#d1f58c' },
  'orbit-match': { title: 'Orbit Match', duration: 60, color: '#c6b0f5' },
  'pulse-orbit': { title: 'Pulse Orbit', duration: 40, color: '#80e1d1' }
};
