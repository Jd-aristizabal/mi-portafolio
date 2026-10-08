import { derived, get, writable } from 'svelte/store';
import { languageService } from '../services/languageService';
import { translateText, type Language } from '../data/translations';
export const language = writable<Language>('es');
export const translate = derived(language, value => (key: string) => translateText(key, value));
export const languageActions = {
  initialize() {
    language.set(languageService.load());
    const sync = (event: StorageEvent) => { if (event.key === languageService.storageKey || event.key === null) language.set(languageService.load()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  },
  toggle() { const next = get(language) === 'es' ? 'en' : 'es'; languageService.save(next); language.set(next); }
};
