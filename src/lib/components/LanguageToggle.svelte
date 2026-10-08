<script lang="ts">
  import { language, languageActions } from '$lib/stores/language';
</script>
<button class="language-toggle" on:click={languageActions.toggle} aria-label={$language === 'es' ? 'Switch to English' : 'Cambiar a español'} title={$language === 'es' ? 'Switch to English' : 'Cambiar a español'}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span>{$language.toUpperCase()}</span>
</button>
<style>
  .language-toggle{display:flex;align-items:center;justify-content:center;gap:7px;min-height:44px;min-width:64px;padding:8px 11px;background:transparent;border:1px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:30px;color:inherit;font-size:11px;letter-spacing:.04em;flex-shrink:0;transition:background .25s,border-color .25s}.language-toggle:hover{background:color-mix(in srgb,currentColor 8%,transparent);border-color:#ab90e0}svg{width:16px;height:16px}
  @media(max-width:760px){.language-toggle{min-width:44px;width:44px;padding:10px}.language-toggle svg{display:none}}
</style>
