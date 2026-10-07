import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { get } from 'svelte/store';
import { taskService } from '../src/lib/services/taskService.ts';
import { scoreService } from '../src/lib/services/scoreService.ts';
import { contactService } from '../src/lib/services/contactService.ts';
import { themeService } from '../src/lib/services/themeService.ts';
import { theme, themeActions } from '../src/lib/stores/theme.ts';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { taskStore, taskActions } from '../src/lib/stores/tasks.ts';
import { multiplierFor, levelFor, targetDurationFor, chooseTarget } from '../src/lib/utils/game.ts';
let saved;
beforeEach(() => {
  saved = new Map();
  globalThis.window = { localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) } };
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
test('El almacenamiento corrupto recupera datos utilizables y descarta entradas inválidas', async () => {
  saved.set('focus-flow:v1', '{invalido');
  assert.equal((await taskService.load()).tasks.length, 3);
  saved.set('focus-flow:v1', JSON.stringify({ tasks: [{ id: 3 }], sessions: [{ minutes: -2 }] }));
  assert.deepEqual(await taskService.load(), { tasks: [], sessions: [] });
  saved.set('pixel-sprint:best', '"incorrecto"');
  assert.equal(await scoreService.best(), 0);
});
test('Una lista vacía persiste sin volver a insertar las tareas demo', async () => {
  await taskService.save({ tasks: [], sessions: [] });
  assert.deepEqual(await taskService.load(), { tasks: [], sessions: [] });
});
test('Las sesiones se conservan al recargar', async () => {
  await taskActions.load();
  await taskActions.session({ id: 'test-session', minutes: 25, taskTitle: 'Proyecto', completedAt: new Date().toISOString() });
  await taskActions.load();
  assert.equal(get(taskStore).sessions[0].minutes, 25);
});
test('El récord nunca disminuye y el leaderboard combina mocks con el récord local', async () => {
  assert.equal(await scoreService.record(3000), 3000);
  assert.equal(await scoreService.record(100), 3000);
  const board = await scoreService.leaderboard();
  assert.equal(board[0].name, 'TÚ');
  assert.equal(board[0].local, true);
  assert.equal(board.length, 5);
});
test('Los fallos de persistencia se comunican a la capa de interfaz', async () => {
  globalThis.window.localStorage.setItem = () => { throw new Error('Almacenamiento bloqueado'); };
  await assert.rejects(taskService.save({ tasks: [], sessions: [] }));
  await assert.rejects(scoreService.record(100));
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
