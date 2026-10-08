<script lang="ts">
  import { translate as t } from '$lib/stores/language';
  import { onMount } from 'svelte';
  import { theme, themeActions } from '$lib/stores/theme';
  onMount(themeActions.initialize);
</script>

<button class="theme-toggle" on:click={themeActions.toggle} aria-label={$t($theme === 'dark' ? 'Activar modo diurno' : 'Activar modo nocturno')} title={$t($theme === 'dark' ? 'Modo diurno' : 'Modo nocturno')} aria-pressed={$theme === 'dark'}>
  <span class="theme-symbols" aria-hidden="true">
    <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
    <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"/><path d="M17 3v4m-2-2h4"/></svg>
  </span>
  <span class="theme-label">{$t($theme === 'dark' ? 'Noche' : 'Día')}</span>
</button>

<style>
  .theme-toggle{display:flex;align-items:center;justify-content:center;gap:8px;min-width:88px;min-height:44px;border:1px solid currentColor;border-color:color-mix(in srgb,currentColor 25%,transparent);background:transparent;border-radius:30px;padding:8px 12px;color:inherit;font-size:11px;transition:background .3s,border-color .3s;flex-shrink:0}
  .theme-toggle:hover{background:color-mix(in srgb,currentColor 8%,transparent);border-color:#ab90e0}
  .theme-symbols{position:relative;width:19px;height:19px;overflow:hidden}
  svg{position:absolute;inset:0;width:19px;height:19px;transition:transform .55s cubic-bezier(.22,1,.36,1),opacity .35s}
  .moon{transform:translateY(25px) rotate(-60deg);opacity:0}
  :global(html[data-theme='dark']) .moon{transform:none;opacity:1}
  :global(html[data-theme='dark']) .sun{transform:translateY(-25px) rotate(90deg);opacity:0}
  @media(max-width:760px){.theme-label{display:none}.theme-toggle{min-width:44px;width:44px;padding:10px}}
  @media(prefers-reduced-motion:reduce){svg,.theme-toggle{transition:none}}
</style>
