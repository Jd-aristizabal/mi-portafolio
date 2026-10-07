// Aplicar el aspecto antes de pintar la página evita destellos al recargar.
(() => {
  const root = document.documentElement;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(root.dataset.themeKey)); } catch {}
  root.dataset.theme = saved === 'light' || saved === 'dark'
    ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'dark' ? '#1c1d20' : '#f5f3ee');
})();
