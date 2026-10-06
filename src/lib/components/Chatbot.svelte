<script lang="ts">
  import Icon from './Icon.svelte';
  import { tick } from 'svelte';
  import { contactService } from '$lib/services/contactService';
  let open = false;
  let input = '';
  let messageList: HTMLDivElement;
  const actions = contactService.getActions();
  let messages = [{ role: 'assistant', text: '¡Hola! Soy el asistente del portafolio de Johan. ¿Qué te gustaría explorar?', link: '', label: '' }];
  async function send(text: string) {
    if (!text.trim()) return;
    const answer = actions.find(a => a.label === text) || contactService.respond(text);
    messages = [...messages, { role: 'user', text: text.trim(), link: '', label: '' }, { role: 'assistant', text: answer.answer, link: answer.link, label: answer.linkLabel }].slice(-12);
    input = '';
    await tick();
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }
</script>
{#if open}
  <aside class="chat-panel" aria-label="Asistente del portafolio">
    <header><span class="chat-avatar"><Icon name="spark" /></span><div><strong>Un pequeño asistente</strong><small>Proyectos, ideas y contacto</small></div><button class="icon-button" aria-label="Cerrar asistente" on:click={() => open = false}><Icon name="close" /></button></header>
    <div class="chat-messages" bind:this={messageList} aria-live="polite">{#each messages as message}<div class:user={message.role === 'user'} class="bubble">{message.text}{#if message.link}<a href={message.link} target={message.link.startsWith('https') ? '_blank' : undefined} rel="noreferrer" on:click={() => { if (message.link.startsWith('/')) open = false; }}>{message.label} ↗</a>{/if}</div>{/each}</div>
    <div class="quick-actions">{#each actions as action}<button on:click={() => send(action.label)}>{action.label}</button>{/each}</div>
    <form on:submit|preventDefault={() => send(input)}><input bind:value={input} aria-label="Mensaje al asistente" placeholder="Escribe tu pregunta…" maxlength="200" /><button class="icon-button" aria-label="Enviar mensaje" disabled={!input.trim()}><Icon name="arrow" /></button></form>
  </aside>
{/if}
<button class="chat-toggle" aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'} aria-expanded={open} on:click={() => open = !open}><Icon name={open ? 'close' : 'chat'} size={23} /></button>
