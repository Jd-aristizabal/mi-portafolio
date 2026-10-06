let revealObserver: IntersectionObserver | undefined;
const pendingReveals = new Set<Element>();

export function reveal(node: HTMLElement, delay = 0) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  node.classList.add('motion-reveal');
  node.style.setProperty('--reveal-delay', `${delay}ms`);
  revealObserver ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver?.unobserve(entry.target);
      pendingReveals.delete(entry.target);
    }
  }, { threshold: 0.1 });
  pendingReveals.add(node);
  revealObserver.observe(node);
  return { destroy() {
    revealObserver?.unobserve(node);
    pendingReveals.delete(node);
    if (!pendingReveals.size) { revealObserver?.disconnect(); revealObserver = undefined; }
  } };
}

export function ambientMotion(node: HTMLElement) {
  let visible = false;
  function update() { node.style.setProperty('--ambient-play', visible && !document.hidden ? 'running' : 'paused'); }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
  observer.observe(node);
  document.addEventListener('visibilitychange', update);
  update();
  return { destroy() { observer.disconnect(); document.removeEventListener('visibilitychange', update); } };
}

export function magnetic(node: HTMLElement, strength = 0.22) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  function move(event: PointerEvent) {
    if (preference.matches || !finePointer.matches) return;
    const box = node.getBoundingClientRect();
    node.style.setProperty('--magnetic-x', `${(event.clientX - box.left - box.width / 2) * strength}px`);
    node.style.setProperty('--magnetic-y', `${(event.clientY - box.top - box.height / 2) * strength}px`);
  }
  function reset() { node.style.setProperty('--magnetic-x', '0px'); node.style.setProperty('--magnetic-y', '0px'); }
  node.classList.add('magnetic');
  node.addEventListener('pointermove', move); node.addEventListener('pointerleave', reset); node.addEventListener('blur', reset); preference.addEventListener('change', reset);
  return { destroy() { node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', reset); node.removeEventListener('blur', reset); preference.removeEventListener('change', reset); } };
}

export function projectMotion(node: HTMLElement) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  function move(event: PointerEvent) {
    if (preference.matches || !finePointer.matches) return;
    cancelAnimationFrame(frame);
    const x = event.clientX, y = event.clientY;
    frame = requestAnimationFrame(() => {
      const box = node.getBoundingClientRect();
      node.style.setProperty('--pointer-x', `${x - box.left}px`); node.style.setProperty('--pointer-y', `${y - box.top}px`);
      node.style.setProperty('--tilt-x', `${-(y - box.top - box.height / 2) / box.height * 5}deg`);
      node.style.setProperty('--tilt-y', `${(x - box.left - box.width / 2) / box.width * 5}deg`);
    });
  }
  function reset() { cancelAnimationFrame(frame); node.style.setProperty('--tilt-x', '0deg'); node.style.setProperty('--tilt-y', '0deg'); }
  node.addEventListener('pointermove', move); node.addEventListener('pointerleave', reset); preference.addEventListener('change', reset);
  return { destroy() { reset(); node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', reset); preference.removeEventListener('change', reset); } };
}

export function parallax(node: HTMLElement, distance = 50) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, visible = true;
  function update() {
    frame = 0;
    if (preference.matches) { node.style.setProperty('--parallax-y', '0px'); return; }
    if (!visible) return;
    const box = node.getBoundingClientRect();
    const position = Math.max(-1, Math.min(1, (window.innerHeight / 2 - box.top - box.height / 2) / window.innerHeight));
    node.style.setProperty('--parallax-y', `${position * distance}px`);
  }
  function schedule() { if (!frame && visible) frame = requestAnimationFrame(update); }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) schedule(); });
  observer.observe(node);
  window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); preference.addEventListener('change', schedule); schedule();
  return { destroy() { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); preference.removeEventListener('change', schedule); } };
}
