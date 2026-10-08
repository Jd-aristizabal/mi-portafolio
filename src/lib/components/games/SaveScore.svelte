<script lang="ts">
  import { onMount } from 'svelte';
  import { arcadeScoreService } from '$lib/services/arcadeScoreService';
  import { arcadeRevision } from '$lib/stores/arcade';
  import type { GameID } from '$lib/types/arcade';
  import type { GameResult } from '$lib/types';
  export let game: GameID;
  export let result: GameResult;
  export let saving = false;
  let name = '';
  let saved = false;
  let error = '';
  let remoteError = '';
  onMount(() => name = arcadeScoreService.playerName());
  async function save() {
    if (saving || saved) return;
    saving = true; error = '';
    try {
      const response = await arcadeScoreService.record(game, result, name);
      name = response.entry.name; remoteError = response.remoteError; saved = true;
      arcadeRevision.update(value => value + 1);
    } catch (cause) { error = cause instanceof Error ? cause.message : 'No se pudo guardar.'; }
    finally { saving = false; }
  }
</script>
<div class="score-save">
  {#if saved}<p class="save-success" role="status">✓ {name}, tu partida quedó guardada.</p><small>Nombre y resultado guardados en este navegador.{game === 'pixel-sprint' && !remoteError ? ' Puntuación enviada al ranking de Pixel Sprint.' : ''}</small>
  {:else}<form on:submit|preventDefault={save}><label for={`player-${game}`}>¿Con qué nombre guardamos tu resultado?</label><div><input id={`player-${game}`} bind:value={name} placeholder="Tu nombre o apodo" minlength="2" maxlength="24" required autocomplete="nickname" disabled={saving} /><button class="button" disabled={saving}>{saving ? 'Guardando…' : 'Guardar resultado'}</button></div><small>Usa un apodo. No necesitas crear una cuenta.</small></form>{/if}
  {#if error}<p class="save-error" role="alert">{error}</p>{/if}
  {#if remoteError}<p class="save-error" role="status">Tu partida está guardada aquí. El ranking no pudo actualizarse: {remoteError}</p>{/if}
</div>
