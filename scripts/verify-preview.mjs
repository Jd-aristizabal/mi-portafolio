import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const origin = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const pageFile = new URL('../src/routes/+page.svelte', import.meta.url);
const original = await readFile(pageFile, 'utf8');
const marker = `revision-${Date.now()}`;
const revised = original.replace('<div class="portfolio">', `<div class="portfolio" data-preview-check="${marker}">`);
assert.notEqual(revised, original, 'No se encontró el contenedor del portafolio.');

async function content(path) {
  const response = await fetch(new URL(path, origin), { cache: 'no-store' });
  assert.ok(response.ok, `No se pudo cargar ${path}: ${response.status}`);
  return response.text();
}
async function verify(expectedMarker) {
  const limit = Date.now() + 10000;
  do {
    const [html, client] = await Promise.all([content('/'), content('/src/routes/+page.svelte')]);
    const bothUpdated = [html, client].every(source => source.includes('Diseño que') && source.includes('portfolio-hero') && !source.includes('Ideas que se') && source.includes(marker) === expectedMarker);
    if (bothUpdated) return;
    await delay(350);
  } while (Date.now() < limit);
  throw new Error('El HTML y el módulo cliente no reflejan la misma revisión del portafolio.');
}

await verify(false);
try {
  await writeFile(pageFile, revised);
  await verify(true);
  console.log('Cambio detectado tanto en el HTML como en el módulo cliente.');
} finally {
  const current = await readFile(pageFile, 'utf8');
  if (current === revised) await writeFile(pageFile, original);
  else throw new Error('La página cambió durante la prueba; se conserva la edición actual.');
}
await verify(false);
console.log('Restauración verificada: el diseño nuevo permanece en ambas respuestas.');
