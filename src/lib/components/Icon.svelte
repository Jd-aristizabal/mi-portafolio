<script lang="ts">
  export let name = 'arrow';
  export let size = 20;
  const paths: Record<string, string> = {
    arrow: 'M5 12h14M13 6l6 6-6 6', plus: 'M12 5v14M5 12h14', check: 'm5 12 4 4L19 6', close: 'm6 6 12 12M6 18 18 6',
    edit: 'm16 3 5 5L8 21H3v-5L16 3ZM13 6l5 5', trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
    play: 'm8 5 11 7-11 7V5Z', pause: 'M8 5v14M16 5v14', reset: 'M3 10a9 9 0 1 1 2 9M3 3v7h7', clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z', chat: 'M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 1 1 19 0Z', trophy: 'M8 3h8v8a4 4 0 0 1-8 0V3ZM8 5H3v3a5 5 0 0 0 5 5M16 5h5v3a5 5 0 0 1-5 5M12 15v6M8 21h8',
    menu: 'M4 6h16M4 12h16M4 18h16', bolt: 'm13 2-9 12h7l-1 8 10-13h-7l1-7Z', external: 'M14 3h7v7M21 3 10 14M10 3H3v18h18v-7'
  };
</script>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name] || paths.arrow} /></svg>
