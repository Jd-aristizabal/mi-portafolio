<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import { taskStore, taskActions } from '$lib/stores/tasks';
  import type { Priority } from '$lib/types';
  import { formatTime } from '$lib/utils/time';
  let filter = 'all';
  let priorityFilter = 'all';
  let title = '';
  let priority: Priority = 'media';
  let editing: string | null = null;
  let notice = '';
  let noticeTimer: ReturnType<typeof setTimeout>;
  let minutes = 25;
  let remaining = 1500;
  let running = false;
  let finishing = false;
  let deadline = 0;
  let selectedTask = '';
  let sessionTitle = '';
  let ready = false;
  let deleteId: string | null = null;
  $: completed = $taskStore.tasks.filter(t => t.completed).length;
  $: totalMinutes = $taskStore.sessions.reduce((total, s) => total + s.minutes, 0);
  $: visible = $taskStore.tasks.filter(t => (filter === 'all' || (filter === 'done' ? t.completed : !t.completed)) && (priorityFilter === 'all' || t.priority === priorityFilter));
  $: progress = (1 - remaining / (minutes * 60)) * 100;
  $: week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - i));
    const sessions = $taskStore.sessions.filter(s => new Date(s.completedAt).toDateString() === date.toDateString());
    return { label: date.toLocaleDateString('es', { weekday: 'short' }), minutes: sessions.reduce((n, s) => n + s.minutes, 0) };
  });
  $: chartMax = Math.max(25, ...week.map(d => d.minutes));
  function notify(message: string) { notice = message; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => notice = '', 4500); }
  async function saveTask() {
    if (!title.trim() || !ready) return;
    const wasEditing = !!editing;
    try { if (editing) await taskActions.edit(editing, title, priority); else await taskActions.add(title, priority); notify(wasEditing ? 'Tarea actualizada.' : 'Una nueva idea, lista para avanzar.'); }
    catch { notify('Cambios aplicados en esta sesión. El navegador no permitió guardarlos.'); }
    title = ''; priority = 'media'; editing = null;
  }
  async function toggle(id: string) { try { await taskActions.toggle(id); } catch { notify('Cambio aplicado. No se pudo guardar en este navegador.'); } }
  async function remove() { if (!deleteId) return; const id = deleteId; deleteId = null; try { await taskActions.remove(id); notify('Tarea eliminada.'); } catch { notify('Tarea eliminada en esta sesión. No se pudo guardar.'); } if (editing === id) { editing = null; title = ''; } if (selectedTask === id) selectedTask = ''; }
  function setDuration(value: number) { if (running || finishing) return; minutes = value; remaining = value * 60; }
  function startPause() {
    if (running) { remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); if (remaining === 0) void finish(); else running = false; return; }
    if (remaining <= 0) remaining = minutes * 60;
    if (remaining === minutes * 60) sessionTitle = $taskStore.tasks.find(t => t.id === selectedTask)?.title || 'Concentración libre';
    deadline = Date.now() + remaining * 1000; running = true;
  }
  function reset() { running = false; remaining = minutes * 60; }
  async function finish() {
    running = false; finishing = true;
    try { await taskActions.session({ id: crypto.randomUUID(), minutes, taskTitle: sessionTitle, completedAt: new Date().toISOString() }); notify('¡Sesión completada! Es momento de un pequeño descanso.'); }
    catch { notify('¡Sesión completada! El historial estará disponible durante esta visita.'); }
    finishing = false;
  }
  onMount(() => {
    taskActions.load().then(() => ready = true).catch(() => { ready = true; notify('No se pudieron cargar las tareas. Puedes crear nuevas.'); });
    const interval = setInterval(() => { if (!running) return; remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); if (!remaining) void finish(); }, 250);
    return () => { clearInterval(interval); clearTimeout(noticeTimer); };
  });
</script>
<svelte:head><title>Focus Flow — Johan Aristizabal</title></svelte:head>
<div class="app-shell shell">
  <a class="back-link" href="/#works">← Volver a Works</a>
  <div class="app-heading"><div><p class="eyebrow">WORK 01 / PRODUCTIVIDAD</p><h1>Focus <span class="serif">Flow.</span><span class="title-symbol">✳</span></h1><p>Respira. Elige una cosa. Encuentra tu ritmo.</p></div><span class="demo-badge"><span></span> TU ESPACIO DE ENFOQUE</span></div>
  <div class="stats-row"><div class="stat"><span>Tareas completadas</span><strong>{completed}<small> / {$taskStore.tasks.length}</small></strong><Icon name="check" /></div><div class="stat"><span>Tiempo de enfoque</span><strong>{totalMinutes}<small> min</small></strong><Icon name="clock" /></div><div class="stat"><span>Sesiones terminadas</span><strong>{$taskStore.sessions.length}<small> sesiones</small></strong><Icon name="spark" /></div></div>
  <div class="focus-layout"><section class="panel tasks-panel"><div class="panel-heading"><h2>Tu próximo paso <span>{$taskStore.tasks.length}</span></h2><Icon name="spark" /></div>
    <form class="task-form" on:submit|preventDefault={saveTask}><label for="task-title">{editing ? 'Editar tarea' : '¿Qué quieres hacer hoy?'}</label><div class="task-input-row"><input id="task-title" bind:value={title} placeholder="Una tarea, una intención…" maxlength="120" required disabled={!ready} /><button class="button dark" disabled={!title.trim() || !ready}><Icon name={editing ? 'check' : 'plus'} /><span>{editing ? 'Guardar' : 'Crear'}</span></button></div><div class="form-bottom"><label for="task-priority">Prioridad</label><select id="task-priority" bind:value={priority}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select>{#if editing}<button type="button" class="text-button" on:click={() => { editing = null; title = ''; }}>Cancelar edición</button>{/if}</div></form>
    <div class="task-filters"><div class="tabs" aria-label="Estado de tareas">{#each [{ id: 'all', label: 'Todas' }, { id: 'pending', label: 'Pendientes' }, { id: 'done', label: 'Completadas' }] as tab}<button class:chosen={filter === tab.id} aria-pressed={filter === tab.id} on:click={() => filter = tab.id}>{tab.label}</button>{/each}</div><select aria-label="Filtrar por prioridad" bind:value={priorityFilter}><option value="all">Toda prioridad</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></div>
    <div class="task-list">{#each visible as task (task.id)}<div class="task-item" class:completed={task.completed}><button class="task-check" class:checked={task.completed} aria-label={task.completed ? `Reabrir ${task.title}` : `Completar ${task.title}`} on:click={() => toggle(task.id)}>{#if task.completed}<Icon name="check" size={14} />{/if}</button><div class="task-text"><span>{task.title}</span><small class="priority" class:high={task.priority === 'alta'} class:low={task.priority === 'baja'}><i></i>{task.priority}</small></div><div class="task-actions"><button class="icon-button" aria-label={`Editar ${task.title}`} on:click={() => { editing = task.id; title = task.title; priority = task.priority; document.getElementById('task-title')?.focus(); }}><Icon name="edit" size={17} /></button><button class="icon-button" aria-label={`Eliminar ${task.title}`} on:click={() => deleteId = task.id}><Icon name="trash" size={17} /></button></div></div>{:else}<div class="empty-state"><Icon name={ready ? 'spark' : 'clock'} size={32} /><h3>{ready ? 'Espacio para una nueva intención' : 'Cargando tu espacio…'}</h3><p>{ready ? 'Crea una tarea o ajusta los filtros para continuar.' : 'Un momento, estamos preparando tus tareas.'}</p></div>{/each}</div>
    <div class="panel-footnote">Una cosa a la vez también es avanzar. <span>↗</span></div>
  </section>
  <aside class="panel timer-panel"><div class="panel-heading"><h2>Modo enfoque</h2><Icon name="clock" /></div><div class="duration-tabs">{#each [1, 15, 25, 50] as duration}<button class:chosen={minutes === duration} disabled={running || finishing} on:click={() => setDuration(duration)}>{duration} min</button>{/each}</div><div class="timer-circle" style={`--progress:${progress}%`}><span class="eyebrow">{running ? 'ESTÁS EN TU FLOW' : remaining === 0 ? 'BIEN HECHO' : remaining < minutes * 60 ? 'TOMA UN RESPIRO' : 'TU MOMENTO EMPIEZA AQUÍ'}</span><strong role="timer" aria-label="Tiempo restante">{formatTime(remaining)}</strong><span>{running ? 'Solo importa este momento.' : 'Sin prisa, con intención.'}</span></div><label for="focus-task" class="small-label">EN QUÉ TE VAS A CONCENTRAR</label><select id="focus-task" bind:value={selectedTask} disabled={running || (remaining < minutes * 60 && remaining > 0)}><option value="">Concentración libre</option>{#each $taskStore.tasks.filter(t => !t.completed) as task}<option value={task.id}>{task.title}</option>{/each}</select><div class="timer-controls"><button class="button dark" on:click={startPause} disabled={finishing}><Icon name={running ? 'pause' : 'play'} size={18} />{running ? 'Pausar' : remaining < minutes * 60 && remaining > 0 ? 'Continuar' : 'Comenzar sesión'}</button><button class="icon-button reset-button" aria-label="Reiniciar temporizador" on:click={reset} disabled={finishing}><Icon name="reset" /></button></div><p class="timer-tip">Prueba la sesión de 1 minuto para explorar la demo.</p></aside></div>
  <div class="focus-bottom"><section class="panel"><div class="panel-heading"><h2>Tu ritmo esta semana</h2><span class="muted">Últimos 7 días</span></div><div class="week-chart">{#each week as day}<div class="chart-column"><span>{day.minutes}m</span><div class="chart-track"><div style={`height:${day.minutes / chartMax * 100}%`}></div></div><small>{day.label}</small></div>{/each}</div></section><section class="panel"><div class="panel-heading"><h2>Pequeños logros</h2><Icon name="check" /></div>{#if $taskStore.sessions.length}<div class="history-list">{#each $taskStore.sessions.slice(0, 5) as session}<div><span class="history-icon"><Icon name="check" size={16} /></span><div><strong>{session.taskTitle}</strong><small>{new Date(session.completedAt).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div><span>{session.minutes} min</span></div>{/each}</div>{:else}<div class="empty-state compact"><Icon name="clock" size={27} /><h3>Tu historia empieza aquí</h3><p>Termina tu primera sesión para verla en el historial.</p></div>{/if}</section></div>
</div>
{#if notice}<div class="toast" role="status"><Icon name="spark" size={18} />{notice}<button class="icon-button" aria-label="Cerrar notificación" on:click={() => notice = ''}><Icon name="close" size={16} /></button></div>{/if}
{#if deleteId}<ConfirmDialog onCancel={() => deleteId = null} onConfirm={remove} />{/if}
