<script lang="ts">export let symbol = 0;</script>
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
  {#if symbol === 0}<ellipse cx="32" cy="32" rx="25" ry="10" transform="rotate(-35 32 32)"/><ellipse cx="32" cy="32" rx="25" ry="10" transform="rotate(35 32 32)"/><circle cx="32" cy="32" r="5" fill="currentColor"/>
  {:else if symbol === 1}<path d="m32 5 6 19 21 8-21 8-6 19-6-19-21-8 21-8Z"/><circle cx="32" cy="32" r="4" fill="currentColor"/>
  {:else if symbol === 2}<path d="M49 42a23 23 0 0 1-27-29A23 23 0 1 0 49 42Z"/><circle cx="47" cy="15" r="3"/>
  {:else if symbol === 3}<path d="M6 20q13-17 26 0t26 0M6 32q13-17 26 0t26 0M6 44q13-17 26 0t26 0" stroke-linecap="round"/>
  {:else if symbol === 4}<path d="m32 6 25 26-25 26L7 32Z"/><path d="m32 18 13 14-13 14-13-14Z"/>
  {:else}<circle cx="32" cy="32" r="7"/><ellipse cx="32" cy="16" rx="8" ry="12"/><ellipse cx="32" cy="48" rx="8" ry="12"/><ellipse cx="16" cy="32" rx="12" ry="8"/><ellipse cx="48" cy="32" rx="12" ry="8"/>{/if}
</svg>
