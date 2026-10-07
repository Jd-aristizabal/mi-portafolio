<script lang="ts">
  import Icon from './Icon.svelte';
  import { tick } from 'svelte';
  import { contactService } from '$lib/services/contactService';
  import { chatDroplet } from '$lib/animations/chat';
  let open = false;
  let input = '';
  let messageList: HTMLDivElement;
  let toggleButton: HTMLButtonElement;
  let messageInput: HTMLInputElement;
  let focusAfterOpen = false;
  async function close() { open = false; await tick(); toggleButton?.focus({ preventScroll: true }); }
  function toggle(event: MouseEvent) { if (open) { void close(); return; } focusAfterOpen = event.detail === 0; open = true; }
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
<svelte:window on:keydown={(event) => { if (open && event.key === 'Escape') { event.preventDefault(); void close(); } }} />
{#if open}
  <aside id="chat-panel" class="chat-panel" aria-label="Asistente del portafolio" inert={!open} transition:chatDroplet={{ trigger: toggleButton }} on:introend={() => { if (open && focusAfterOpen) messageInput?.focus({ preventScroll: true }); }}>
    <header><span class="chat-avatar"><Icon name="spark" /></span><div><strong>Un pequeño asistente</strong><small>Proyectos, ideas y contacto</small></div><button class="icon-button" aria-label="Cerrar asistente" on:click={close}><Icon name="close" /></button></header>
    <div class="chat-messages" bind:this={messageList} aria-live="polite">{#each messages as message}<div class:user={message.role === 'user'} class="bubble">{message.text}{#if message.link}<a href={message.link} target={message.link.startsWith('https') ? '_blank' : undefined} rel="noreferrer" on:click={() => { if (message.link.startsWith('/')) open = false; }}>{message.label} ↗</a>{/if}</div>{/each}</div>
    <div class="quick-actions">{#each actions as action}<button on:click={() => send(action.label)}>{action.label}</button>{/each}</div>
    <form on:submit|preventDefault={() => send(input)}><input bind:this={messageInput} bind:value={input} aria-label="Mensaje al asistente" placeholder="Escribe tu pregunta…" maxlength="200" /><button class="icon-button" aria-label="Enviar mensaje" disabled={!input.trim()}><Icon name="arrow" /></button></form>
  </aside>
{/if}
<button id="chat-trigger" bind:this={toggleButton} class="chat-toggle" class:chat-open={open} aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'} aria-expanded={open} aria-controls="chat-panel" on:click={toggle}><Icon name={open ? 'close' : 'chat'} size={23} /></button>
<style>
  .chat-panel{--chat-origin:#282c27;--chat-surface:var(--surface);animation:none;will-change:transform;border-radius:13px}
  .chat-panel > *{opacity:var(--chat-content-opacity,1);translate:0 var(--chat-content-offset,0px)}
  .chat-toggle::before{content:'';position:absolute;bottom:65%;left:50%;width:22px;height:36px;border-radius:50%;background:inherit;transform-origin:50% 100%;transform:translateX(-50%) scaleY(0);pointer-events:none;z-index:-1}
  .chat-toggle.chat-open::before{animation:droplet-neck .78s ease-in-out both}
  .chat-toggle.chat-open{animation:droplet-source .78s ease-in-out}
  @keyframes droplet-neck{0%{transform:translateX(-50%) scale(.5,0);opacity:0}18%{transform:translateX(-50%) scale(.8,1);opacity:1}38%{transform:translateX(-50%) translateY(-12px) scale(.3,.3);opacity:0}100%{transform:translateX(-50%) scale(0);opacity:0}}
  @keyframes droplet-source{0%,100%{scale:1}22%{scale:1.06 .92}48%{scale:.97 1.03}}
  @media(prefers-reduced-motion:reduce){.chat-toggle.chat-open{animation:none}.chat-toggle::before{display:none}}
</style>
