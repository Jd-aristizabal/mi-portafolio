import { writable, get } from 'svelte/store';
import type { TaskState, Priority, FocusSession } from '../types';
import { taskService } from '../services/taskService';
export const taskStore = writable<TaskState>({ tasks: [], sessions: [] });
export const taskActions = {
  async load() { taskStore.set(await taskService.load()); },
  async persist() { await taskService.save(get(taskStore)); },
  async add(title: string, priority: Priority) { taskStore.update(s => ({ ...s, tasks: [{ id: crypto.randomUUID(), title: title.trim(), priority, completed: false, createdAt: new Date().toISOString() }, ...s.tasks] })); await this.persist(); },
  async edit(id: string, title: string, priority: Priority) { taskStore.update(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, title: title.trim(), priority } : t) })); await this.persist(); },
  async toggle(id: string) { taskStore.update(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) })); await this.persist(); },
  async remove(id: string) { taskStore.update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) })); await this.persist(); },
  async session(session: FocusSession) { taskStore.update(s => ({ ...s, sessions: [session, ...s.sessions].slice(0, 100) })); await this.persist(); }
};
