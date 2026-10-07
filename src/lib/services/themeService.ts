import { readLocal, writeLocal } from './storage';
import type { Theme } from '$lib/types/theme';

function storageKey() { return document.documentElement.dataset.themeKey!; }

export const themeService = {
  load(): Theme | null {
    const value = readLocal(storageKey());
    return value === 'light' || value === 'dark' ? value : null;
  },
  save(theme: Theme) {
    try { writeLocal(storageKey(), theme); } catch { /* La preferencia sigue activa durante la visita. */ }
  },
  apply(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1c1d20' : '#f5f3ee');
  }
};
