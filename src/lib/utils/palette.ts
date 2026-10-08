export type Harmony = 'analogous' | 'complementary' | 'triadic';
export function hslHex(h: number, s: number, l: number) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2,'0'); };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}
export function buildPalette(hue: number, harmony: Harmony) {
  const offset = harmony === 'complementary' ? 180 : harmony === 'triadic' ? 120 : 30;
  return [
    { name:'Base', key:'base', hex:hslHex(hue,18,94) },
    { name:'Principal', key:'primary', hex:hslHex(hue,62,57) },
    { name:'Compañero', key:'secondary', hex:hslHex(hue + offset,48,72) },
    { name:'Acento', key:'accent', hex:hslHex(hue - offset,70,66) },
    { name:'Tinta', key:'ink', hex:hslHex(hue,24,17) }
  ];
}
function luminance(hex: string) {
  const channels = [1,3,5].map(i => parseInt(hex.slice(i,i + 2),16) / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
export function contrast(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x,y) + .05) / (Math.min(x,y) + .05); }
export function paletteText(background: string) {
  const light = contrast(background,'#ffffff'), dark = contrast(background,'#1c1d20');
  if (Math.max(light,dark) < 4.5) return '#000000';
  return light > dark ? '#ffffff' : '#1c1d20';
}
