import { contact, quickActions } from '../data/config';
export const contactService = { getContact: () => contact, getActions: () => quickActions, respond(text: string) { const query = text.toLowerCase(); return quickActions.find(a => a.id === (/(trabaj|contact|hola|proyecto nuevo)/.test(query) ? 'work' : /(juego|focus|proyectos|pixel)/.test(query) ? 'projects' : 'about'))!; } };
