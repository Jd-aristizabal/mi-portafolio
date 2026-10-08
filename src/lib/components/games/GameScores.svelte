<script lang="ts">
  import { onMount } from 'svelte';
  import { arcadeScoreService } from '$lib/services/arcadeScoreService';
  import { arcadeRevision } from '$lib/stores/arcade';
  import type { GameID, NamedScore } from '$lib/types/arcade';
  import type { Score } from '$lib/types';
  export let game: GameID;
  let ready = false;
  let history: NamedScore[] = [];
  let best = 0;
  let community: Score[] = [];
  let error = '';
  let loading = false;
  let request = 0;
  $: if (ready) { $arcadeRevision; void load(); }
  async function load() {
    const token = ++request;
    loading = true;
    try {
      const summary = await arcadeScoreService.summary(game);
      if (token !== request) return;
      history = summary.history; best = summary.best; community = summary.community; error = summary.error;
    } catch { if (token === request) error = 'No se pudieron cargar tus partidas.'; }
    finally { if (token === request) loading = false; }
  }
  onMount(() => { ready = true; return () => { request++; }; });
</script>
<aside class="arcade-scores">
  <section class="arcade-record"><span>MEJOR MARCA</span><strong>{best.toLocaleString('es-CO')}</strong><p>Tu próximo reto empieza aquí.</p></section>
  <section class="panel"><div class="panel-heading"><h2>Tus partidas</h2><span class="muted">{history.length.toString().padStart(2,'0')}</span></div>
    {#each history as row}<div class="named-score"><div><strong>{row.name}</strong><small>{new Date(row.createdAt).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}</small></div><span>{row.score.toLocaleString('es-CO')}</span></div>{:else}<div class="arcade-empty"><span aria-hidden="true">↗</span><p>Tu nombre podría estar aquí.</p><small>Juega y guarda tu primera partida.</small></div>{/each}
    <p class="score-location">Guardadas en este navegador.</p>
  </section>
  {#if game === 'pixel-sprint'}<section class="panel"><div class="panel-heading"><h2>Ranking global</h2><span class="mock-badge">TOP 10</span></div>{#each community as row, i}<div class="named-score"><div><strong>{i + 1}. {row.name}</strong></div><span>{row.score.toLocaleString('es-CO')}</span></div>{/each}{#if loading}<p class="score-location">Actualizando ranking…</p>{/if}{#if error}<p class="score-location" role="status">{error}</p>{/if}</section>{/if}
  <a class="arcade-other" href="/#works">Explorar otras experiencias <span>↗</span></a>
</aside>
