import { writable, get } from 'svelte/store';
import type { TaskState, Priority } from '../types';
import { taskService } from '../services/taskService';
export const taskStore = writable<TaskState>({ tasks: [], sessions: [] });
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation);
  queue = result.catch(() => undefined);
  return result;
}
async function refreshStats() {
  const stats = await taskService.stats();
  taskStore.update(s => ({ ...s, stats }));
}
export const taskActions = {
  async load() { taskStore.set(await taskService.load()); },
  add(title: string, priority: Priority) { return serial(async () => { const task = await taskService.create(title, priority); taskStore.update(s => ({ ...s, tasks: [task, ...s.tasks] })); await refreshStats(); }); },
  edit(id: string, title: string, priority: Priority) { return serial(async () => { const task = await taskService.update(id, { title: title.trim(), priority }); taskStore.update(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? task : t) })); }); },
  toggle(id: string) { return serial(async () => { const current = get(taskStore).tasks.find(t => t.id === id); if (!current) return; const task = await taskService.update(id, { completed: !current.completed }); taskStore.update(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? task : t) })); await refreshStats(); }); },
  remove(id: string) { return serial(async () => { await taskService.remove(id); taskStore.update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) })); await refreshStats(); }); },
  start(minutes: number, taskID?: string) { return serial(async () => { const session = await taskService.start(minutes, taskID); taskStore.update(s => ({ ...s, activeSession: session })); return session; }); },
  complete(id: string) { return serial(async () => { const session = await taskService.complete(id); taskStore.update(s => ({ ...s, activeSession: undefined, sessions: [{ id: session.id, minutes: session.duration_seconds / 60, completedAt: session.finished_at!, taskTitle: session.task_title }, ...s.sessions.filter(v => v.id !== id)].slice(0, 100) })); await refreshStats(); }); },
  cancel(id: string) { return serial(async () => { await taskService.cancel(id); taskStore.update(s => ({ ...s, activeSession: undefined })); }); }
};
