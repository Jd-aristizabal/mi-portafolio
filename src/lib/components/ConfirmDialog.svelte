<script lang="ts">
  import { onMount } from 'svelte';
  export let onCancel: () => void;
  export let onConfirm: () => void;
  let dialog: HTMLDialogElement;
  onMount(() => { dialog.showModal(); });
</script>
<dialog bind:this={dialog} class="confirm-dialog" aria-labelledby="delete-title" on:cancel|preventDefault={onCancel}>
  <h2 id="delete-title">¿Eliminar esta tarea?</h2><p>Esta acción quitará la tarea de tu lista.</p>
  <div><button class="button outline" on:click={onCancel}>Conservar</button><button class="button dark" on:click={onConfirm}>Eliminar tarea</button></div>
</dialog>
