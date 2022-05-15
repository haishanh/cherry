<script lang="ts">
  export let name: string;

  export let color: string | number = 0;

  const colorMap = {
    '3': 'color:var(--color-text);background:hsl(0deg 0% 97%);border-color:hsl(0deg 0% 80%);',
    '0': 'color:#14551B;background:#ADF29B;',
    '1': 'color:#65670F;background:#E6E97B;',
    '2': 'color:#6C0E58;background:#FFAAD3;',
  };
</script>

<span style={colorMap[color]}>
  {name}
</span>

<style lang="scss">
  span {
    background-color: #ccc;
    border-radius: 100px;
    padding: 5px 8px;
    font-size: 0.9em;
    border: 1px solid transparent;
    font-weight: 800;
  }
</style>
