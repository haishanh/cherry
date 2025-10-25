<script lang="ts" module>
  import CherryLeaf from '$lib/components/base/CherryLeaf.svelte';
</script>

<div class="root">
  <h2>No bookmarks found</h2>
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
