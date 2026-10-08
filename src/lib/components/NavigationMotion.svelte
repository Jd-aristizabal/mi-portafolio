<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { onDestroy } from 'svelte';
  let active = false;
  let label = '';
  let sequence = 0;
  let cleanup: ReturnType<typeof setTimeout>;
  afterNavigate(({ from, to }) => {
    if (!from || !to || from.url.pathname === to.url.pathname || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    label = to.url.pathname.includes('focus-flow') ? 'Encuentra tu flow.' : to.url.pathname.includes('pixel-sprint') ? 'Entra en juego.' : to.url.pathname.includes('orbit-match') ? 'Todo está conectado.' : to.url.pathname.includes('pulse-orbit') ? 'Encuentra tu instante.' : to.url.pathname.includes('color-studio') ? 'Dale un nuevo color.' : 'Siempre creando.';
    sequence++;
    active = true;
    clearTimeout(cleanup);
    cleanup = setTimeout(() => active = false, 1200);
  });
  onDestroy(() => clearTimeout(cleanup));
</script>
{#if active}{#key sequence}<div class="navigation-curtain" aria-hidden="true"><span>{label}</span></div>{/key}{/if}
<style>
  .navigation-curtain{position:fixed;inset:0;background:#bda1ed;z-index:100;pointer-events:none;display:grid;place-items:center;color:#30233e;font-family:'Instrument Serif',Georgia,serif;font-size:clamp(35px,5vw,70px);animation:curtain-pass 1.15s cubic-bezier(.76,0,.24,1) both}
  .navigation-curtain span{animation:curtain-label 1.15s both}
  @keyframes curtain-pass{0%{transform:translateY(100%);border-radius:40% 40% 0 0}40%{transform:translateY(0);border-radius:0}100%{transform:translateY(-110%);border-radius:0 0 40% 40%}}
  @keyframes curtain-label{0%,15%{opacity:0;transform:translateY(15px)}35%,55%{opacity:1;transform:translateY(0)}80%,100%{opacity:0;transform:translateY(-15px)}}
  @media(prefers-reduced-motion:reduce){.navigation-curtain{display:none}}
</style>
