import type { Task, TaskState, Priority, FocusStats, ActiveSession } from '../types';
import { api } from './api';
type APITask = Omit<Task, 'createdAt'> & { created_at: string };
type APISession = ActiveSession & { task_title: string; finished_at: string | null; status: string };
const task = (value: APITask): Task => ({ ...value, createdAt: value.created_at });
async function tasks(): Promise<Task[]> {
  const result: Task[] = [];
  for (let offset = 0; offset <= 10000; offset += 100) {
    const page = await api<APITask[]>(`/focus/tasks?limit=100&offset=${offset}`);
    result.push(...page.map(task));
    if (page.length < 100) break;
  }
  return result;
}
export const taskService = {
  stats() { return api<FocusStats>('/focus/stats?time_zone=' + encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)); },
  async load(): Promise<TaskState> {
    const [list, sessions, stats] = await Promise.all([tasks(), api<APISession[]>('/focus/sessions?limit=100'), this.stats()]);
    return { tasks: list, stats, activeSession: sessions.find(s => s.status === 'active'), sessions: sessions.filter(s => s.status === 'completed' && s.finished_at).map(s => ({ id: s.id, minutes: s.duration_seconds / 60, taskTitle: s.task_title, completedAt: s.finished_at! })) };
  },
  async create(title: string, priority: Priority) { return task(await api<APITask>('/focus/tasks', 'POST', { title: title.trim(), priority })); },
  async update(id: string, changes: { title?: string; priority?: Priority; completed?: boolean }) { return task(await api<APITask>('/focus/tasks/' + id, 'PATCH', changes)); },
  remove(id: string) { return api<void>('/focus/tasks/' + id, 'DELETE'); },
  start(minutes: number, taskID?: string) { return api<ActiveSession>('/focus/sessions', 'POST', { duration_seconds: minutes * 60, ...(taskID ? { task_id: taskID } : {}) }); },
  complete(id: string) { return api<APISession>(`/focus/sessions/${id}/complete`, 'PATCH'); },
  cancel(id: string) { return api<APISession>(`/focus/sessions/${id}/cancel`, 'PATCH'); }
};
