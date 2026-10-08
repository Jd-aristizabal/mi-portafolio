<script lang="ts">
  import { onMount } from 'svelte';
  import MemorySymbol from '$lib/components/games/MemorySymbol.svelte';
  import SaveScore from '$lib/components/games/SaveScore.svelte';
  import GameScores from '$lib/components/games/GameScores.svelte';
  import { memoryDeck } from '$lib/utils/arcade';
  let phase: 'idle' | 'countdown' | 'playing' | 'result' = 'idle';
  let cards = memoryDeck(() => .5);
  let picked: number[] = [];
  let matched: number[] = [];
  let points = 0, attempts = 0, combo = 0, maxCombo = 0, seconds = 60, count = 3;
  let deadline = 0, countdownAt = 0, resolveAt = 0;
  let saving = false;
  let feedback = 'Encuentra las conexiones.';
  $: won = matched.length === 12;
  function start() { cards = memoryDeck(); picked = []; matched = []; points = 0; attempts = 0; combo = 0; maxCombo = 0; seconds = 60; count = 3; resolveAt = 0; phase = 'countdown'; countdownAt = performance.now() + 3000; feedback = 'Tu memoria tiene su propio universo.'; }
  function end() { if (phase !== 'playing') return; phase = 'result'; if (matched.length === 12) points += seconds * 10; picked = []; }
  function flip(id: number) {
    if (phase !== 'playing' || picked.length === 2 || picked.includes(id) || matched.includes(id)) return;
    const now = performance.now(); if (now >= deadline) { end(); return; }
    picked = [...picked, id];
    if (picked.length !== 2) return;
    attempts++;
    const pair = picked.map(key => cards.find(card => card.id === key)!);
    if (pair[0].symbol === pair[1].symbol) {
      combo++; maxCombo = Math.max(maxCombo, combo); const earned = 150 + combo * 25;
      points += earned; matched = [...matched, ...picked]; feedback = `Una conexión más. +${earned}`;
    } else { combo = 0; feedback = 'Mira de nuevo. Ya casi lo tienes.'; }
    resolveAt = now + 650;
  }
  onMount(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      if (phase === 'countdown') { count = Math.max(1, Math.ceil((countdownAt - now) / 1000)); if (now >= countdownAt) { phase = 'playing'; deadline = now + 60000; } }
      if (phase !== 'playing') return;
      seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
      if (resolveAt && now >= resolveAt) { picked = []; resolveAt = 0; if (matched.length === 12) { end(); return; } }
      if (!seconds) end();
    }, 80);
    return () => clearInterval(interval);
  });
</script>
<svelte:head><title>Orbit Match — Johan Aristizabal</title><meta name="description" content="Encuentra las seis parejas de un pequeño universo visual. Un juego de memoria, formas y conexiones." /></svelte:head>
<div class="app-shell shell arcade-app memory-app">
  <a class="back-link" href="/#works">← Volver a Works</a>
  <div class="app-heading"><div><p class="eyebrow">WORK 03 / MEMORIA VISUAL</p><h1>Orbit <span class="serif">Match.</span></h1><p>Un pequeño universo. Seis conexiones por descubrir.</p></div><span class="demo-badge"><span></span> MEMORIA + UN POCO DE INTUICIÓN</span></div>
  <div class="arcade-layout"><section class="arcade-playfield">
    <div class="arcade-topline"><span>CONSTELLATION / 002</span><span>CONNECT THE LITTLE THINGS.</span></div>
    <div class="arcade-metrics"><div><span>PUNTOS</span><strong>{points.toString().padStart(4,'0')}</strong></div><div><span>TIEMPO</span><strong>{seconds}<small>s</small></strong></div><div><span>PAREJAS</span><strong>{matched.length / 2}<small>/ 6</small></strong></div></div>
    <div class="arcade-track"><span style={`width:${seconds / 60 * 100}%`}></span></div>
    <div class="memory-arena">
      <div class="memory-board" class:inactive={phase !== 'playing' && phase !== 'result'}>
        {#each cards as card (card.id)}<button class="memory-card" class:revealed={picked.includes(card.id) || matched.includes(card.id) || phase === 'result'} class:matched={matched.includes(card.id)} disabled={phase !== 'playing' || picked.length === 2 || matched.includes(card.id)} on:click={() => flip(card.id)} aria-label={matched.includes(card.id) ? `Pareja encontrada, símbolo ${card.symbol + 1}` : picked.includes(card.id) ? `Símbolo ${card.symbol + 1}` : `Descubrir carta ${cards.indexOf(card) + 1}`}><span class="memory-card-inner"><span class="memory-back"><span class="card-orbit"></span><small>{(cards.indexOf(card) + 1).toString().padStart(2,'0')}</small></span><span class="memory-front" style={`--symbol-color:${['#c6b0f5','#f2c780','#94d8dc','#f0a7be','#b2dcaa','#d4b8ff'][card.symbol]}`}><MemorySymbol symbol={card.symbol} />{#if matched.includes(card.id)}<small>✓</small>{/if}</span></span></button>{/each}
      </div>
      {#if phase === 'idle'}<div class="arcade-overlay"><div class="memory-emblem"><MemorySymbol symbol={0} /></div><p class="eyebrow">TODO ESTÁ CONECTADO</p><h2>Lo viste.<br /><span class="serif">¿Lo recuerdas?</span></h2><p>Descubre dos cartas. Encuentra su pareja.<br />Conecta las seis antes de que pase un minuto.</p><button class="arcade-button" on:click={start}>Descubrir mi universo <span>↗</span></button></div>
      {:else if phase === 'countdown'}<div class="arcade-overlay arcade-countdown" aria-live="assertive"><span>OBSERVA. RECUERDA. CONECTA.</span><strong>{count}</strong></div>{/if}
    </div>
    {#if phase === 'result'}<div class="arcade-result" aria-live="polite"><span>{won ? 'UN UNIVERSO COMPLETO' : 'CADA CONEXIÓN CUENTA'}</span><h2>{points}<small> puntos</small></h2><p>{matched.length / 2} parejas · {attempts} intentos · mejor racha {maxCombo}</p><SaveScore game="orbit-match" result={{ score:points, max_combo:maxCombo, level:matched.length / 2 + 1, duration_seconds:60 - seconds }} bind:saving /><button class="arcade-button" on:click={start} disabled={saving}>Otra constelación <span>↻</span></button></div>
    {:else}<p class="arcade-feedback" role="status">{feedback}</p>{/if}
    <div class="arcade-footline"><span>6 PAREJAS / 12 CARTAS</span><span>{combo > 1 ? `RACHA ×${combo}` : 'ENCUENTRA TU CONEXIÓN'}</span></div>
  </section><GameScores game="orbit-match" /></div>
  <div class="arcade-tips"><div><span>01</span><h3>Observa las formas.</h3><p>Cada símbolo tiene una pareja. El orden cambia en cada partida.</p></div><div><span>02</span><h3>Encuentra tu ritmo.</h3><p>Las parejas consecutivas suman más. Un fallo rompe la racha.</p></div><div><span>03</span><h3>Gana tiempo.</h3><p>Completa las seis y cada segundo restante te regala 10 puntos.</p></div></div>
</div>
