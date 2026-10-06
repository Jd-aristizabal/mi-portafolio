export type Priority = 'alta' | 'media' | 'baja';
export interface Task { id: string; title: string; priority: Priority; completed: boolean; createdAt: string }
export interface FocusSession { id: string; minutes: number; completedAt: string; taskTitle: string }
export interface TaskState { tasks: Task[]; sessions: FocusSession[] }
export interface TaskRepository { load(): Promise<TaskState>; save(state: TaskState): Promise<void> }
export interface Score { name: string; score: number; local?: boolean }
export interface ScoreRepository { best(): Promise<number>; record(score: number): Promise<number>; leaderboard(): Promise<Score[]> }
