import type { TaskRepository, Task, FocusSession } from '../types';
import { initialTasks } from '../data/mock';
import { readLocal, writeLocal } from './storage';
function validTask(item: unknown): item is Task {
  if (!item || typeof item !== 'object') return false;
  const t = item as Task;
  return typeof t.id === 'string' && typeof t.title === 'string' && ['alta', 'media', 'baja'].includes(t.priority) && typeof t.completed === 'boolean' && typeof t.createdAt === 'string';
}
function validSession(item: unknown): item is FocusSession {
  if (!item || typeof item !== 'object') return false;
  const s = item as FocusSession;
  return typeof s.id === 'string' && Number.isFinite(s.minutes) && s.minutes > 0 && typeof s.completedAt === 'string' && typeof s.taskTitle === 'string';
}
export const taskService: TaskRepository = {
  async load() {
    const value = readLocal('focus-flow:v1') as { tasks?: unknown; sessions?: unknown } | null;
    return { tasks: Array.isArray(value?.tasks) ? value.tasks.filter(validTask) : structuredClone(initialTasks), sessions: Array.isArray(value?.sessions) ? value.sessions.filter(validSession) : [] };
  },
  async save(state) { writeLocal('focus-flow:v1', state); }
};
