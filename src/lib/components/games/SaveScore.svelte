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
  let submissionID: string;
  onMount(() => { name = arcadeScoreService.playerName(); submissionID = crypto.randomUUID(); });
  async function save() {
    if (saving || saved) return;
    saving = true; error = '';
    try {
      const response = await arcadeScoreService.record(game, result, name, submissionID);
      name = response.entry.name; saved = true;
      arcadeRevision.update(value => value + 1);
    } catch (cause) { error = cause instanceof Error ? cause.message : 'No se pudo guardar.'; }
    finally { saving = false; }
  }
</script>
<div class="score-save">
  {#if saved}<p class="save-success" role="status">✓ {name}, tu partida quedó guardada.</p><small>Nombre y puntuación guardados en el servidor. Tu mejor marca participa en el ranking global.</small>
  {:else}<form on:submit|preventDefault={save}><label for={`player-${game}`}>¿Con qué nombre guardamos tu resultado?</label><div><input id={`player-${game}`} bind:value={name} placeholder="Tu nombre o apodo" minlength="2" maxlength="24" required autocomplete="nickname" disabled={saving} /><button class="button" disabled={saving}>{saving ? 'Guardando…' : 'Guardar resultado'}</button></div><small>Usa un apodo. No necesitas crear una cuenta.</small></form>{/if}
  {#if error}<p class="save-error" role="alert">{error}</p>{/if}
</div>
