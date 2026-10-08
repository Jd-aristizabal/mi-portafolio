<script lang="ts">
  import { onMount } from 'svelte';
  import SaveScore from '$lib/components/games/SaveScore.svelte';
  import GameScores from '$lib/components/games/GameScores.svelte';
  import { angleDistance, pulsePoints } from '$lib/utils/arcade';
  let phase: 'idle' | 'countdown' | 'playing' | 'result' = 'idle';
  let angle = 0, zone = 0, seconds = 40, count = 3, points = 0, hits = 0, misses = 0, combo = 0, maxCombo = 0;
  let countdownAt = 0, deadline = 0, lastFrame = 0;
  let saving = false;
  let feedback = 'Un instante. Todo cambia.';
  let hitGlow = false, glowUntil = 0;
  $: multiplier = Math.min(4, 1 + Math.floor(combo / 4));
  $: speed = Math.min(240, 115 + hits * 6);
  function start() { angle = 180; zone = 0; seconds = 40; count = 3; points = 0; hits = 0; misses = 0; combo = 0; maxCombo = 0; feedback = 'Espera el momento perfecto.'; hitGlow = false; phase = 'countdown'; countdownAt = performance.now() + 3000; }
  function end() { if (phase === 'playing') phase = 'result'; }
  function tap() {
    if (phase !== 'playing') return;
    const now = performance.now(); if (now >= deadline) { end(); return; }
    // Medir el instante del toque, incluso entre dos frames de renderizado.
    angle = (angle + (now - lastFrame) * speed / 1000) % 360; lastFrame = now;
    const distance = angleDistance(angle, zone);
    const earned = pulsePoints(distance, combo);
    if (earned) { points += earned; hits++; combo++; maxCombo = Math.max(maxCombo, combo); hitGlow = true; glowUntil = now + 350; feedback = `${distance <= 5 ? 'PERFECTO' : 'EN EL PULSO'} +${earned}`; zone = (zone + 80 + Math.random() * 170) % 360; }
    else { misses++; combo = 0; hitGlow = false; feedback = 'Respira. Vuelve a encontrar el pulso.'; }
  }
  function keydown(event: KeyboardEvent) {
    if (phase !== 'playing' || event.code !== 'Space' || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    const origin = event.target;
    if (origin instanceof HTMLElement && (origin.isContentEditable || ['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(origin.tagName))) return;
    event.preventDefault(); tap();
  }
  onMount(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      if (phase === 'countdown') { count = Math.max(1, Math.ceil((countdownAt - now) / 1000)); if (now >= countdownAt) { phase = 'playing'; deadline = now + 40000; lastFrame = now; } }
      if (phase !== 'playing') return;
      angle = (angle + (now - lastFrame) * speed / 1000) % 360; lastFrame = now;
      seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
      if (now >= glowUntil) hitGlow = false;
      if (!seconds) end();
    }, 25);
    return () => clearInterval(interval);
  });
</script>
<svelte:window on:keydown={keydown} />
<svelte:head><title>Pulse Orbit — Johan Aristizabal</title><meta name="description" content="Encuentra el instante perfecto. Toca cuando el satélite atraviese el arco luminoso y encadena tu mejor racha." /></svelte:head>
<div class="app-shell shell arcade-app pulse-app">
  <a class="back-link" href="/#works">← Volver a Works</a>
  <div class="app-heading"><div><p class="eyebrow">WORK 04 / PRECISIÓN & RITMO</p><h1>Pulse <span class="serif">Orbit.</span></h1><p>El universo se mueve. Encuentra tu instante.</p></div><span class="demo-badge"><span></span> UN TOQUE. EL MOMENTO PERFECTO.</span></div>
  <div class="arcade-layout"><section class="arcade-playfield">
    <div class="arcade-topline"><span>ORBITAL / 003</span><span>GOOD THINGS TAKE TIMING.</span></div>
    <div class="arcade-metrics"><div><span>PUNTOS</span><strong>{points.toString().padStart(4,'0')}</strong></div><div><span>TIEMPO</span><strong>{seconds}<small>s</small></strong></div><div><span>MULTIPLICADOR</span><strong>×{multiplier}</strong></div></div>
    <div class="arcade-track"><span style={`width:${seconds / 40 * 100}%`}></span></div>
    <div class="pulse-arena">
      <div class="pulse-orbit" class:hit-glow={hitGlow} style={`--orbit-angle:${angle}deg;--zone-angle:${zone - 16}deg`} aria-hidden="true"><span class="pulse-grid-ring outer"></span><span class="pulse-grid-ring inner"></span><div class="pulse-rail"></div><div class="pulse-zone"></div><div class="pulse-satellite"><span></span></div><div class="pulse-core"><span>{phase === 'playing' ? 'ENCUENTRA' : 'PULSE'}</span><strong class="serif">{phase === 'playing' ? 'tu instante.' : 'orbit.'}</strong><small>{phase === 'playing' ? `RACHA ${combo.toString().padStart(2,'0')}` : 'MAKE IT COUNT'}</small></div></div>
      {#if phase === 'idle'}<div class="pulse-intro"><p>El punto recorre la órbita.<br />Toca cuando atraviese el arco verde.</p><button class="arcade-button" on:click={start}>Encontrar mi pulso <span>↗</span></button><small>Toca el botón o usa la barra espaciadora.</small></div>
      {:else if phase === 'countdown'}<div class="pulse-countdown" aria-live="assertive"><strong>{count}</strong><span>RESPIRA. OBSERVA. TOCA.</span></div>
      {:else if phase === 'playing'}<button class="arcade-button pulse-tap" on:click={tap}>Ahora <span>◎</span></button>{/if}
    </div>
    {#if phase === 'result'}<div class="arcade-result" aria-live="polite"><span>ENCONTRASTE TU RITMO</span><h2>{points}<small> puntos</small></h2><p>{hits} aciertos · {hits + misses ? Math.round(hits / (hits + misses) * 100) : 0}% precisión · racha {maxCombo}</p><SaveScore game="pulse-orbit" result={{ score:points, max_combo:maxCombo, level:Math.min(8, 1 + Math.floor(hits / 4)), duration_seconds:40 }} bind:saving /><button class="arcade-button" on:click={start} disabled={saving}>Un nuevo instante <span>↻</span></button></div>
    {:else}<p class="arcade-feedback" class:perfect={hitGlow} role="status">{feedback}</p>{/if}
    <div class="arcade-footline"><span>40 SEGUNDOS / SIN PRISA POR FALLAR</span><span>{hits} CONEXIONES</span></div>
  </section><GameScores game="pulse-orbit" /></div>
  <div class="arcade-tips"><div><span>01</span><h3>Sigue el satélite.</h3><p>El arco luminoso es tu objetivo. Toca al cruzarlo.</p></div><div><span>02</span><h3>Busca el centro.</h3><p>Un toque perfecto vale el doble. Cada cuatro aciertos aumenta el combo.</p></div><div><span>03</span><h3>Escucha tu ritmo.</h3><p>La órbita gana velocidad. Un fallo rompe la racha, pero conservas tus puntos.</p></div></div>
</div>
