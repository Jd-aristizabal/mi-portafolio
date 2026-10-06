import type { Task, Score } from '../types';
export const initialTasks: Task[] = [
  { id: 'demo-1', title: 'Darle forma a una nueva idea', priority: 'alta', completed: false, createdAt: '2026-10-06T12:00:00Z' },
  { id: 'demo-2', title: 'Encontrar inspiración para el próximo proyecto', priority: 'media', completed: false, createdAt: '2026-10-06T12:00:00Z' },
  { id: 'demo-3', title: 'Tomar un descanso y recargar energía', priority: 'baja', completed: true, createdAt: '2026-10-06T12:00:00Z' }
];
export const mockLeaderboard: Score[] = [{ name: 'NOVA', score: 2450 }, { name: 'LUNA', score: 1920 }, { name: 'KAI', score: 1580 }, { name: 'SOL', score: 1120 }];
