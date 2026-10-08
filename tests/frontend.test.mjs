import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { get } from 'svelte/store';
import { taskService } from '../src/lib/services/taskService.ts';
import { scoreService } from '../src/lib/services/scoreService.ts';
import { chatService } from '../src/lib/services/chatService.ts';
import { api, clientID } from '../src/lib/services/api.ts';
import { contactService } from '../src/lib/services/contactService.ts';
import { themeService } from '../src/lib/services/themeService.ts';
import { theme, themeActions } from '../src/lib/stores/theme.ts';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { cardGleam } from '../src/lib/animations/cardGleam.ts';
import { parallax } from '../src/lib/animations/motion.ts';
import { arcadeScoreService } from '../src/lib/services/arcadeScoreService.ts';
import { memoryDeck, angleDistance, pulsePoints } from '../src/lib/utils/arcade.ts';
import { buildPalette, hslHex, contrast, paletteText } from '../src/lib/utils/palette.ts';
import { taskStore, taskActions } from '../src/lib/stores/tasks.ts';
import { multiplierFor, levelFor, targetDurationFor, chooseTarget } from '../src/lib/utils/game.ts';
let saved, remoteTasks, remoteSessions, remoteScores, calls;
beforeEach(() => {
  saved = new Map();
  remoteTasks = []; remoteSessions = []; remoteScores = []; calls = [];
  taskStore.set({ tasks: [], sessions: [] });
  globalThis.window = { localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) } };
  globalThis.fetch = async (url, options) => {
    const path = new URL(url).pathname.replace('/api/v1', '');
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ path, method: options.method, body, headers: options.headers });
    let data;
    if (path === '/focus/stats') data = { tasks_completed: remoteTasks.filter(t => t.completed).length, tasks_total: remoteTasks.length, focused_minutes: remoteSessions.filter(s => s.status === 'completed').reduce((n, s) => n + s.duration_seconds / 60, 0), sessions_completed: remoteSessions.filter(s => s.status === 'completed').length, last_7_days: [] };
    else if (path === '/focus/tasks' && options.method === 'POST') { data = { ...body, id: crypto.randomUUID(), completed: false, created_at: new Date().toISOString() }; remoteTasks.unshift(data); }
    else if (path === '/focus/tasks') data = remoteTasks;
    else if (path.startsWith('/focus/tasks/')) { const id = path.split('/').at(-1); if (options.method === 'DELETE') { remoteTasks = remoteTasks.filter(t => t.id !== id); return new Response(null, { status: 204 }); } data = Object.assign(remoteTasks.find(t => t.id === id), body); }
    else if (path === '/focus/sessions' && options.method === 'POST') { data = { ...body, id: crypto.randomUUID(), started_at: new Date().toISOString(), status: 'active', task_title: 'Proyecto', task_id: body.task_id || null }; remoteSessions.unshift(data); }
    else if (path === '/focus/sessions') data = remoteSessions;
    else if (path.startsWith('/focus/sessions/')) { data = remoteSessions.find(s => s.id === path.split('/')[3]); data.status = path.endsWith('/complete') ? 'completed' : 'cancelled'; data.finished_at = new Date().toISOString(); }
    else if (path === '/games/pixel-sprint/scores') { remoteScores.push(body); data = body; }
    else if (path === '/games/pixel-sprint/me') data = { best_score: Math.max(0, ...remoteScores.map(s => s.score)) };
    else if (path === '/games/pixel-sprint/leaderboard') data = [{ player_name: null, score: 3000 }];
    else if (path === '/chat') data = { conversation_id: 'saved-conversation', message: 'Johan desarrolla Focus Flow.' };
    else throw new Error('Ruta de prueba desconocida: ' + path);
    return Response.json({ data });
  };
});

test('Las partidas conservan el nombre y se separan por juego sin enviar a rutas inexistentes', async () => {
  const result = { score:700, max_combo:3, level:2, duration_seconds:40 };
  await arcadeScoreService.record('orbit-match', result, '  Johan   A  ');
  await arcadeScoreService.record('pulse-orbit', { ...result, score:900 }, 'Luna');
  assert.equal(arcadeScoreService.history('orbit-match')[0].name, 'Johan A');
  assert.equal(arcadeScoreService.history('pulse-orbit')[0].score, 900);
  assert.equal(arcadeScoreService.best('orbit-match'), 700);
  assert.equal((await arcadeScoreService.summary('orbit-match')).history[0].name, 'Johan A');
  assert.equal(arcadeScoreService.playerName(), 'Luna');
  assert.equal(calls.length, 0);
  await arcadeScoreService.record('pixel-sprint', result, 'Johan');
  assert.deepEqual(remoteScores[0], result);
  assert.equal(arcadeScoreService.history('pixel-sprint')[0].name, 'Johan');
  globalThis.fetch = async () => { throw new Error('Sin conexión'); };
  const offline = await arcadeScoreService.record('pixel-sprint', { ...result, score:1200 }, 'Luna');
  assert.ok(offline.remoteError);
  assert.equal(arcadeScoreService.best('pixel-sprint'), 1200);
  await assert.rejects(arcadeScoreService.record('orbit-match', result, ' '), /nombre/);
  await assert.rejects(arcadeScoreService.record('orbit-match', { ...result, score:NaN }, 'Johan'), /puntuación/);
});

test('El récord sobrevive al límite del historial y los fallos de guardado no simulan éxito', async () => {
  const result = { score:10000, max_combo:3, level:2, duration_seconds:40 };
  await arcadeScoreService.record('orbit-match', result, 'Johan');
  for (let i = 0; i < 160; i++) await arcadeScoreService.record('orbit-match', { ...result, score:i }, 'Luna');
  assert.equal(arcadeScoreService.best('orbit-match'), 10000);
  assert.ok(JSON.parse(saved.get('portfolio:arcade-scores:v1')).length <= 150);
  saved.set('portfolio:arcade-scores:v1', '{malformado');
  assert.deepEqual(arcadeScoreService.history('orbit-match'), []);
  window.localStorage.setItem = () => { throw new Error('Bloqueado'); };
  await assert.rejects(arcadeScoreService.record('orbit-match', result, 'Johan'), /guardar/);
  assert.equal(calls.length, 0);
});

test('La memoria siempre tiene seis parejas y el pulso mide correctamente el cruce de cero', () => {
  const deck = memoryDeck(() => .35);
  assert.equal(deck.length, 12);
  assert.equal(new Set(deck.map(card => card.id)).size, 12);
  for (let symbol = 0; symbol < 6; symbol++) assert.equal(deck.filter(card => card.symbol === symbol).length, 2);
  assert.equal(angleDistance(359,1), 2);
  assert.equal(angleDistance(1,359), 2);
  assert.equal(pulsePoints(2,0), 200);
  assert.equal(pulsePoints(12,4), 200);
  assert.equal(pulsePoints(17,9), 0);
  assert.equal(pulsePoints(0,100), 800);
});

test('Color Studio genera colores válidos y conserva el contraste de texto sobre el fondo', () => {
  assert.equal(hslHex(0,100,50), '#ff0000');
  assert.equal(hslHex(120,100,50), '#00ff00');
  assert.equal(hslHex(240,100,50), '#0000ff');
  for (const harmony of ['analogous','complementary','triadic']) for (let hue = 0; hue < 360; hue += 15) {
    const colors = buildPalette(hue, harmony);
    assert.equal(colors.length, 5);
    for (const color of colors) {
      assert.match(color.hex, /^#[0-9a-f]{6}$/);
      assert.ok(contrast(color.hex,paletteText(color.hex)) >= 4.5);
    }
    assert.ok(contrast(colors[0].hex,colors[4].hex) >= 4.5);
  }
});

test('El átomo no se desplaza con el scroll móvil y recupera el parallax en escritorio', () => {
  const compact = Object.assign(new EventTarget(), { matches: true });
  const reduced = Object.assign(new EventTarget(), { matches: false });
  const events = new EventTarget();
  window.matchMedia = query => query.includes('760px') ? compact : reduced;
  window.addEventListener = events.addEventListener.bind(events);
  window.removeEventListener = events.removeEventListener.bind(events);
  window.innerHeight = 800;
  const old = { request: globalThis.requestAnimationFrame, cancel: globalThis.cancelAnimationFrame, observer: globalThis.IntersectionObserver };
  const frames = new Map();
  let id = 0, measurements = 0, disconnected = false;
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = frame => frames.delete(frame);
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() { disconnected = true; }
  };
  const properties = new Map();
  const node = { style: { setProperty: (key, value) => properties.set(key, value) }, getBoundingClientRect: () => { measurements++; return { top: 100, height: 300 }; } };
  let action;
  try {
    action = parallax(node, 90);
    events.dispatchEvent(new Event('scroll'));
    assert.equal(properties.get('--parallax-y'), '0px');
    assert.equal(frames.size, 0);
    assert.equal(measurements, 0);
    compact.matches = false;
    compact.dispatchEvent(new Event('change'));
    assert.equal(frames.size, 1);
    const [frame, callback] = frames.entries().next().value;
    frames.delete(frame); callback();
    assert.notEqual(properties.get('--parallax-y'), '0px');
    compact.matches = true;
    compact.dispatchEvent(new Event('change'));
    events.dispatchEvent(new Event('resize'));
    assert.equal(properties.get('--parallax-y'), '0px');
    assert.equal(frames.size, 0);
    action.destroy(); action = undefined;
    assert.equal(disconnected, true);
    compact.matches = false;
    compact.dispatchEvent(new Event('change'));
    events.dispatchEvent(new Event('scroll'));
    assert.equal(frames.size, 0);
  } finally {
    action?.destroy();
    globalThis.requestAnimationFrame = old.request;
    globalThis.cancelAnimationFrame = old.cancel;
    globalThis.IntersectionObserver = old.observer;
  }
});

test('El reflejo funciona al tocar, se reinicia y respeta movimiento reducido', () => {
  const preference = Object.assign(new EventTarget(), { matches: false });
  window.matchMedia = () => preference;
  const animations = [];
  const layer = { animate: () => {
    const animation = { cancelled: false, cancel() { this.cancelled = true; } };
    animations.push(animation);
    return animation;
  } };
  const card = Object.assign(new EventTarget(), { querySelector: () => layer });
  const action = cardGleam(card);
  const touchEnter = Object.assign(new Event('pointerenter'), { pointerType: 'touch' });
  card.dispatchEvent(touchEnter);
  assert.equal(animations.length, 0);
  card.dispatchEvent(new Event('click'));
  assert.equal(animations.length, 1);
  card.dispatchEvent(new Event('click'));
  assert.equal(animations[0].cancelled, true);
  assert.equal(animations.length, 2);
  preference.matches = true;
  preference.dispatchEvent(new Event('change'));
  assert.equal(animations[1].cancelled, true);
  card.dispatchEvent(new Event('click'));
  assert.equal(animations.length, 2);
  preference.matches = false;
  action.destroy();
  card.dispatchEvent(new Event('click'));
  assert.equal(animations.length, 2);
});

test('El aspecto sigue el dispositivo, conserva la elección y sincroniza otras pestañas', () => {
  const listeners = new Map();
  const media = { matches: true, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  let metaColor;
  globalThis.document = { documentElement: { dataset: { themeKey: 'portfolio:theme' } }, querySelector: () => ({ setAttribute: (_name, value) => metaColor = value }) };
  window.matchMedia = () => media;
  window.addEventListener = (name, fn) => listeners.set(name, fn);
  window.removeEventListener = name => listeners.delete(name);
  const cleanup = themeActions.initialize();
  assert.equal(get(theme), 'dark');
  assert.equal(metaColor, '#1c1d20');
  themeActions.toggle();
  assert.equal(get(theme), 'light');
  assert.equal(themeService.load(), 'light');
  media.matches = true;
  listeners.get('change')();
  assert.equal(get(theme), 'light');
  saved.set('portfolio:theme', JSON.stringify('dark'));
  listeners.get('storage')({ key: 'portfolio:theme' });
  assert.equal(document.documentElement.dataset.theme, 'dark');
  cleanup();
  assert.equal(listeners.size, 0);
});

test('El aspecto se aplica antes de pintar y tolera almacenamiento bloqueado o inválido', () => {
  globalThis.document = { documentElement: { dataset: { themeKey: 'portfolio:theme' } }, querySelector: () => null };
  theme.set('dark');
  window.matchMedia = () => ({ matches: true });
  const source = readFileSync(new URL('../static/theme-init.js', import.meta.url), 'utf8');
  for (const [value, systemDark, expected] of [['"light"', true, 'light'], ['"dark"', false, 'dark'], ['invalido', true, 'dark'], ['"otro"', false, 'light'], [null, true, 'dark']]) {
    const root = { dataset: { themeKey: 'portfolio:theme' } };
    runInNewContext(source, { document: { documentElement: root, querySelector: () => null }, localStorage: { getItem: () => { if (value === null) throw new Error('Bloqueado'); return value; } }, matchMedia: () => ({ matches: systemDark }) });
    assert.equal(root.dataset.theme, expected);
  }
  window.localStorage.setItem = () => { throw new Error('Bloqueado'); };
  assert.doesNotThrow(() => themeActions.toggle());
  assert.equal(get(theme), 'light');
});
test('Las tareas pueden crearse, editarse, completarse, recargarse y eliminarse', async () => {
  await taskActions.load();
  await taskActions.add('  Preparar un proyecto  ', 'alta');
  const task = get(taskStore).tasks[0];
  assert.equal(task.title, 'Preparar un proyecto');
  await taskActions.edit(task.id, 'Publicar un proyecto', 'baja');
  await taskActions.toggle(task.id);
  await taskActions.load();
  const loaded = get(taskStore).tasks.find(t => t.id === task.id);
  assert.equal(loaded.title, 'Publicar un proyecto');
  assert.equal(loaded.priority, 'baja');
  assert.equal(loaded.completed, true);
  await taskActions.remove(task.id);
  assert.equal((await taskService.load()).tasks.some(t => t.id === task.id), false);
});
test('Las tareas demo y récords locales no sustituyen datos del servidor', async () => {
  saved.set('focus-flow:v1', '{invalido');
  assert.equal((await taskService.load()).tasks.length, 0);
  saved.set('pixel-sprint:best', '"incorrecto"');
  assert.equal(await scoreService.best(), 0);
});
test('La identidad anónima es estable entre solicitudes', async () => {
  const id = clientID();
  await taskService.load();
  assert.equal(clientID(), id);
  assert.ok(calls.every(call => call.headers['X-Client-ID'] === id));
});
test('Las sesiones se conservan al recargar', async () => {
  await taskActions.load();
  const active = await taskActions.start(25);
  assert.equal(calls.find(c => c.path === '/focus/sessions' && c.method === 'POST').body.duration_seconds, 1500);
  await taskActions.load();
  assert.equal(get(taskStore).activeSession.id, active.id);
  await taskActions.complete(active.id);
  await taskActions.load();
  assert.equal(get(taskStore).sessions[0].minutes, 25);
});
test('La puntuación envía métricas reales y el leaderboard no incorpora mocks', async () => {
  const result = { score: 3000, max_combo: 10, level: 3, duration_seconds: 30 };
  assert.equal(await scoreService.record(result), 3000);
  assert.deepEqual(calls.find(c => c.method === 'POST').body, result);
  assert.equal(await scoreService.record({ ...result, score: 100 }), 3000);
  const board = await scoreService.leaderboard();
  assert.equal(board[0].name, 'Anónimo');
  assert.equal(board.length, 1);
});
test('Los fallos de persistencia se comunican a la capa de interfaz', async () => {
  globalThis.fetch = async () => Response.json({ error: { message: 'No disponible' } }, { status: 503 });
  await assert.rejects(taskActions.add('No guardada', 'media'));
  assert.equal(get(taskStore).tasks.length, 0);
});
test('El chat conserva el identificador remoto y no usa respuestas predefinidas', async () => {
  assert.equal(await chatService.send('Quien es Johan?'), 'Johan desarrolla Focus Flow.');
  await chatService.send('Que proyectos tiene?');
  assert.equal(calls[1].body.conversation_id, 'saved-conversation');
});
test('El rate limit informa el plazo y no reintenta llamadas costosas', async () => {
  let requests = 0;
  globalThis.fetch = async () => { requests++; return Response.json({ error: { message: 'Limite' } }, { status: 429, headers: { 'Retry-After': '42' } }); };
  await assert.rejects(api('/chat', 'POST', { message: 'Hola' }), /42 segundos/);
  assert.equal(requests, 1);
});
test('El combo y la dificultad progresan con límites estables', () => {
  assert.equal(multiplierFor(4), 1);
  assert.equal(multiplierFor(5), 2);
  assert.equal(multiplierFor(999), 5);
  assert.equal(levelFor(6), 1);
  assert.equal(levelFor(7), 2);
  assert.equal(levelFor(999), 8);
  assert.ok(targetDurationFor(7) < targetDurationFor(0));
  assert.ok(targetDurationFor(999) >= 450);
  for (let previous = 0; previous < 9; previous++) {
    for (const sample of [0, 0.4, 0.99]) {
      const next = chooseTarget(previous, () => sample);
      assert.notEqual(next, previous);
      assert.ok(next >= 0 && next < 9);
    }
  }
});
test('El asistente resuelve contacto y proyectos con configuración local', () => {
  assert.equal(contactService.respond('Quiero trabajar contigo').link, contactService.getContact().whatsappUrl);
  assert.equal(contactService.respond('Quiero ver Pixel Sprint').link, '/#works');
});
