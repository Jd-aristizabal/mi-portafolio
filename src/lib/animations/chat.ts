import { cubicInOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export function chatDroplet(node: HTMLElement, { trigger }: { trigger: HTMLButtonElement }): TransitionConfig {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return { duration: 0 };
  const panel = node.getBoundingClientRect();
  const button = trigger.getBoundingClientRect();
  const dx = button.left + button.width / 2 - (panel.left + panel.width / 2);
  const dy = button.top + button.height / 2 - (panel.top + panel.height / 2);
  const diameter = button.width * .55;

  return {
    duration: 780,
    easing: cubicInOut,
    css: t => {
      // Primero se desprende la gota; después se despliega su contenido.
      const grow = t ** 1.5;
      const travel = 1 - Math.min(1, t * 1.35);
      const sx = diameter / panel.width + (1 - diameter / panel.width) * grow;
      const sy = diameter / panel.height + (1 - diameter / panel.height) * grow;
      const content = Math.max(0, Math.min(1, (t - .55) / .45));
      return `transform-origin:center;transform:translate(${dx * travel}px,${dy * travel}px) scale(${sx},${sy});border-radius:calc(${50 * (1 - grow)}% + ${13 * grow}px);background:color-mix(in srgb,var(--chat-origin) ${100 * (1 - t)}%,var(--chat-surface));--chat-content-opacity:${content};--chat-content-offset:${(1 - content) * 8}px;`;
    }
  };
}
