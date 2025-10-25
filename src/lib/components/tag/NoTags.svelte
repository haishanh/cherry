<script lang="ts" module>
  import CherryLeaf from '$lib/components/base/CherryLeaf.svelte';
</script>

<div class="root">
  <h2>No tags yet</h2>
  <p>You can create tags when adding bookmarks</p>
  <div>
    <CherryLeaf />
  </div>
</div>

<style lang="scss">
  .root {
    display: flex;
    flex-direction: column;
    align-items: center;
    h2 {
      font-weight: normal;
    }
  }
</style>
