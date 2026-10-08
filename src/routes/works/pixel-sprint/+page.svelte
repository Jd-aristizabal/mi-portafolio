<script lang="ts">
  import Asterisk from '$lib/components/Asterisk.svelte';
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { scoreService } from '$lib/services/scoreService';
  import { errorMessage } from '$lib/services/api';
  import type { Score } from '$lib/types';
  import { gameRules, multiplierFor, levelFor, targetDurationFor, chooseTarget } from '$lib/utils/game';
  type Phase = 'idle' | 'countdown' | 'playing' | 'result';
  let phase: Phase = 'idle';
  let count = 3;
  let points = 0;
  let best = 0;
  let previousBest = 0;
  let combo = 0;
  let maxCombo = 0;
  let hits = 0;
  let misses = 0;
  let seconds = gameRules.durationSeconds;
  let target = -1;
  let lastTarget = -1;
  let deadline = 0;
  let nextAt = 0;
  let countdownAt = 0;
  let feedback = '';
  let flashCell = -1;
  let flashUntil = 0;
  let scores: Score[] = [];
  let storageError = '';
  $: multiplier = multiplierFor(combo);
  $: level = levelFor(hits);
  $: accuracy = hits + misses ? Math.round(hits / (hits + misses) * 100) : 0;
  async function refreshScores() { best = await scoreService.best(); scores = await scoreService.leaderboard(); }
  function newTarget(now: number) { target = chooseTarget(lastTarget); lastTarget = target; nextAt = now + targetDurationFor(hits); }
  function start() { points = 0; combo = 0; hits = 0; misses = 0; maxCombo = 0; seconds = gameRules.durationSeconds; feedback = ''; flashCell = -1; target = -1; count = 3; previousBest = best; phase = 'countdown'; countdownAt = performance.now() + 3000; }
  async function end() { if (phase !== 'playing') return; phase = 'result'; target = -1; const result = { score: points, max_combo: maxCombo, level: levelFor(hits), duration_seconds: gameRules.durationSeconds }; try { best = await scoreService.record(result); await refreshScores(); storageError = ''; } catch (error) { storageError = errorMessage(error); } }
  function hit(cell: number) {
    if (phase !== 'playing') return;
    const now = performance.now();
    if (now >= deadline) { void end(); return; }
    if (now >= nextAt) { misses++; combo = 0; newTarget(now); return; }
    flashCell = cell; flashUntil = now + 220;
    if (cell === target) { const earned = 100 * multiplierFor(combo); points += earned; combo++; hits++; maxCombo = Math.max(maxCombo, combo); feedback = `+${earned}`; newTarget(now); }
    else { misses++; combo = 0; feedback = '¡Casi!'; }
  }
  function keydown(event: KeyboardEvent) { if (phase !== 'playing' || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return; const origin = event.target; if (origin instanceof HTMLElement && (origin.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(origin.tagName))) return; const cell = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(event.key); if (cell >= 0) { event.preventDefault(); hit(cell); } }
  onMount(() => {
    void refreshScores().catch(error => storageError = errorMessage(error));
    const interval = setInterval(() => {
      const now = performance.now();
      if (flashCell >= 0 && now >= flashUntil) flashCell = -1;
      if (phase === 'countdown') { count = Math.max(1, Math.ceil((countdownAt - now) / 1000)); if (now >= countdownAt) { phase = 'playing'; deadline = now + gameRules.durationSeconds * 1000; newTarget(now); } }
      if (phase === 'playing') { seconds = Math.max(0, Math.ceil((deadline - now) / 1000)); if (seconds <= 0) { void end(); return; } if (now >= nextAt) { misses++; combo = 0; feedback = 'Sigue intentando'; newTarget(now); } }
    }, 40);
    return () => clearInterval(interval);
  });
</script>
<svelte:window on:keydown={keydown} />
<svelte:head><title>Pixel Sprint — Johan Aristizabal</title></svelte:head>
<div class="app-shell shell pixel-app"><a class="back-link" href="/#works">← Volver a Works</a><div class="app-heading"><div><p class="eyebrow">WORK 02 / CREATIVE PLAYGROUND</p><h1>Pixel <span class="serif">Sprint.</span><span class="title-symbol">↗</span></h1><p>Confía en tus reflejos. Persigue el siguiente píxel.</p></div><span class="demo-badge"><span></span> 30 SEGUNDOS · SUPERA TU RÉCORD</span></div>
  <div class="pixel-layout"><section class="game-panel"><div class="game-topbar"><span><i></i> ARCADE / 001</span><span>30 SEGUNDOS. TODOS TUS REFLEJOS.</span></div><div class="game-stats"><div><span>PUNTUACIÓN</span><strong>{points.toString().padStart(4, '0')}</strong></div><div><span>TIEMPO</span><strong class:urgent={seconds <= 10 && phase === 'playing'}>{seconds}<small>s</small></strong></div><div><span>COMBO</span><strong class="combo-value">×{multiplier}</strong></div></div><div class="time-track"><div style={`width:${seconds / 30 * 100}%`}></div></div>
  <div class="arena"><div class="pixel-board" class:playing={phase === 'playing'}>{#each Array.from({ length: 9 }, (_, i) => i) as cell}<button class="pixel-cell" class:target={target === cell && phase === 'playing'} class:flash={flashCell === cell} disabled={phase !== 'playing'} on:click={() => hit(cell)} aria-label={`Casilla ${cell + 1}`}><span class="cell-number">{cell + 1}</span>{#if target === cell && phase === 'playing'}<span class="target-pixel"><Asterisk /></span>{/if}{#if flashCell === cell}<span class="cell-feedback">{feedback}</span>{/if}</button>{/each}</div>
  {#if phase === 'idle'}<div class="game-overlay"><span class="arcade-icon"><Icon name="bolt" size={38} /></span><p class="eyebrow">¿LISTO PARA ENTRAR EN JUEGO?</p><h2>Pequeños píxeles.<br />Grandes reflejos.</h2><p>Toca el píxel verde antes de que desaparezca.<br />Encadena aciertos y multiplica tus puntos.</p><button class="button lime" on:click={start}>Iniciar partida <Icon name="play" size={18} /></button><small>Toca, haz clic o usa las teclas del 1 al 9.</small></div>
  {:else if phase === 'countdown'}<div class="game-overlay countdown" aria-live="assertive"><p class="eyebrow">PREPARA TUS REFLEJOS</p><strong>{count}</strong><p>¡Vamos a darle!</p></div>
  {:else if phase === 'result'}<div class="game-overlay result"><Icon name="trophy" size={35} /><p class="eyebrow">{points > previousBest ? '¡NUEVO RÉCORD PERSONAL!' : 'PARTIDA COMPLETADA'}</p><h2>{points}<small> puntos</small></h2><div class="result-stats"><span><strong>{hits}</strong>Aciertos</span><span><strong>{accuracy}%</strong>Precisión</span><span><strong>{maxCombo}</strong>Mejor racha</span></div><button class="button lime" on:click={start}>Una vez más <Icon name="reset" size={18} /></button><small>Cada intento es una nueva oportunidad.</small></div>{/if}</div>
  <div class="game-bottom"><span>NIVEL {level.toString().padStart(2, '0')} <span class="level-dots">{'▮'.repeat(level)}{'▯'.repeat(8 - level)}</span></span><span>{phase === 'playing' ? `${combo} ACIERTOS EN RACHA` : 'ENCUENTRA TU RITMO'}</span></div></section>
  <aside class="pixel-sidebar"><section class="panel record-panel"><Icon name="trophy" size={24} /><p class="eyebrow">TU MEJOR PUNTUACIÓN</p><strong>{best.toLocaleString('es-CO')}</strong><p>Un pequeño reto contigo mismo.</p></section><section class="panel leaderboard"><div class="panel-heading"><h2>Marcas a superar</h2><span class="mock-badge">TOP 10</span></div><p class="leaderboard-note">Mejores puntuaciones de la comunidad.</p>{#each scores as score, i}<div class="leader-row" class:local={score.local}><span>{(i + 1).toString().padStart(2, '0')}</span><strong>{score.name}</strong><span>{score.score.toLocaleString('es-CO')}</span></div>{/each}</section><section class="game-instructions"><h3>El secreto está en el ritmo.</h3><p><span>01</span> Sigue el píxel verde.</p><p><span>02</span> Cada 5 aciertos aumenta tu combo.</p><p><span>03</span> La velocidad sube cada 7 aciertos.</p><small>Un fallo rompe la racha. Tu puntuación se conserva. El combo llega hasta ×5.</small></section></aside></div>
  {#if storageError}<p class="storage-note" role="status">{storageError}</p>{/if}<div class="game-caption"><Icon name="spark" size={18} /><p>Un experimento en interacción, feedback y ese irresistible “una partida más”.</p></div>
</div>
