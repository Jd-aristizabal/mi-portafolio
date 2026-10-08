export type Priority = 'alta' | 'media' | 'baja';
export interface Task { id: string; title: string; priority: Priority; completed: boolean; createdAt: string }
export interface FocusSession { id: string; minutes: number; completedAt: string; taskTitle: string }
export interface ActiveSession { id: string; duration_seconds: number; started_at: string; task_id: string | null }
export interface FocusStats { tasks_completed: number; tasks_total: number; focused_minutes: number; sessions_completed: number; last_7_days: { date: string; focused_minutes: number }[] }
export interface TaskState { tasks: Task[]; sessions: FocusSession[]; activeSession?: ActiveSession; stats?: FocusStats }
export interface Score { name: string; score: number; local?: boolean }
export interface GameResult { score: number; max_combo: number; level: number; duration_seconds: number }
export interface ScoreRepository { best(): Promise<number>; record(result: GameResult): Promise<number>; leaderboard(): Promise<Score[]> }
