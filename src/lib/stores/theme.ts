import { get, writable } from 'svelte/store';
import { themeService } from '../services/themeService';
import type { Theme } from '$lib/types/theme';

export const theme = writable<Theme>('light');
let transitionRunning = false;
function apply(value: Theme) { themeService.apply(value); theme.set(value); }

export const themeActions = {
  initialize() {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => apply(themeService.load() ?? (system.matches ? 'dark' : 'light'));
    sync();
    const storage = (event: StorageEvent) => { if (event.key === document.documentElement.dataset.themeKey || event.key === null) sync(); };
    system.addEventListener('change', sync);
    window.addEventListener('storage', storage);
    return () => { system.removeEventListener('change', sync); window.removeEventListener('storage', storage); };
  },
  toggle() {
    if (transitionRunning) return;
    const next = get(theme) === 'dark' ? 'light' : 'dark';
    themeService.save(next);
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      transitionRunning = true;
      const transition = document.startViewTransition(() => apply(next));
      void transition.finished.catch(() => {}).finally(() => { transitionRunning = false; });
    } else apply(next);
  }
};
