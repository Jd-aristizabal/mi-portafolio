export function readLocal(key: string): unknown {
  if (typeof window === 'undefined') return null;
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function writeLocal(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
