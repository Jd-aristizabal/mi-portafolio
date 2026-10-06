<script lang="ts">export let name: string; export let size = 36;</script>
<svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
  {#if name === 'javascript' || name === 'typescript'}
    <rect x="3" y="3" width="42" height="42" rx="7" fill={name === 'javascript' ? '#edd35e' : '#548aba'} />
    <text x="40" y="36" text-anchor="end" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill={name === 'javascript' ? '#383121' : '#fff'}>{name === 'javascript' ? 'JS' : 'TS'}</text>
  {:else if name === 'html' || name === 'css'}
    <path d="M6 4h36l-3.5 35L24 44 9.5 39 6 4Z" fill={name === 'html' ? '#d9825b' : '#9276c1'} /><path d="M24 7h15l-3 29-12 4V7Z" fill="white" fill-opacity=".14" />
    {#if name === 'html'}<path d="M15 13h19l-.5 5H20l.4 4h12.5l-1.3 12L24 37l-7.5-3-.5-6h5l.2 2.5 3 1 3-1 .4-4H16l-1-13Z" fill="#fff" />{:else}<path d="M15 13h19l-.5 5-8 5h7.3l-1.3 11L24 37l-7.5-3-.5-6h5l.2 2.5 3 1 3-1 .4-3.5H16l-.4-4 9-6H15.5L15 13Z" fill="#fff" />{/if}
  {:else if name === 'python'}
    <path d="M24 4c-12 0-13 3-13 10v5h14v3H8c-6 0-6 17 0 17h5v-7c0-6 4-8 10-8h11V12c0-6-4-8-10-8Z" fill="#6b96c6" /><circle cx="19" cy="10" r="2" fill="#f5f3ee" />
    <path d="M24 44c12 0 13-3 13-10v-5H23v-3h17c6 0 6-17 0-17h-5v7c0 6-4 8-10 8H14v12c0 6 4 8 10 8Z" fill="#e7ca61" /><circle cx="29" cy="38" r="2" fill="#f5f3ee" />
  {:else if name === 'go'}
    <path d="M3 17h10M1 23h10M4 29h8" stroke="#73b7c6" stroke-width="2.5" stroke-linecap="round" />
    <text x="12" y="32" font-family="Arial, sans-serif" font-size="25" font-weight="800" font-style="italic" letter-spacing="-3" fill="#73b7c6">GO</text>
  {:else if name === 'php'}
    <ellipse cx="24" cy="24" rx="23" ry="14" fill="#8d95c0" /><text x="24" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" font-style="italic" letter-spacing="-1" fill="#f9f8f4">php</text>
  {:else}
    <path d="m33 5-18 11c-8 5-8 15-1 20l2 1 17-10c5-3 5-9 1-12l-2-1-14 8c-1 1-1 3 1 4l2 1 10-6" stroke="#d4866c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" /><path d="m15 43 18-11c8-5 8-15 1-20l-2-1-17 10c-5 3-5 9-1 12l2 1 14-8" stroke="#d4866c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  {/if}
</svg>
