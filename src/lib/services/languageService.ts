import { readLocal, writeLocal } from './storage';
import type { Language } from '../data/translations';
const KEY = 'portfolio:language';
export const languageService = {
  load(): Language { return readLocal(KEY) === 'en' ? 'en' : 'es'; },
  save(language: Language) { try { writeLocal(KEY, language); } catch { /* El idioma se conserva durante la visita. */ } },
  apply(language: Language, home: boolean) { document.documentElement.lang = home ? language : 'es'; },
  storageKey: KEY
};
