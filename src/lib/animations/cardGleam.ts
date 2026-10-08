export function cardGleam(node: HTMLElement) {
  const layer = node.querySelector<HTMLElement>('.skill-gleam');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation: Animation | undefined;

  function stop() { animation?.cancel(); animation = undefined; }
  function play() {
    stop();
    if (reducedMotion.matches || !layer) return;
    animation = layer.animate([
      { transform: 'translate3d(-100%,0,0)', opacity: 0, offset: 0 },
      { transform: 'translate3d(-65%,0,0)', opacity: 1, offset: .15 },
      { transform: 'translate3d(65%,0,0)', opacity: 1, offset: .85 },
      { transform: 'translate3d(100%,0,0)', opacity: 0, offset: 1 }
    ], { duration: 750, easing: 'ease-out' });
  }
  function enter(event: PointerEvent) { if (event.pointerType !== 'touch') play(); }
  node.addEventListener('pointerenter', enter);
  node.addEventListener('click', play);
  reducedMotion.addEventListener('change', stop);
  return { destroy() {
    stop();
    node.removeEventListener('pointerenter', enter);
    node.removeEventListener('click', play);
    reducedMotion.removeEventListener('change', stop);
  } };
}
