<script lang="ts">
  import type { TagType } from '$lib/type';

  type Props = {
    tag: TagType;
  };

  let { tag }: Props = $props();
</script>

<a class="tag" href="/?tag={tag.id}">{tag.name}</a>

<style lang="scss">
  .tag {
    padding: 4px 10px;
    display: inline-flex;
    align-items: center;
    font-size: 0.9em;
    border-radius: 100px;
    border: 1px solid transparent;
    text-decoration: none;

    --fg: var(--color-text3);

    color: var(--fg);
    border-color: var(--fg);

    &:hover {
      color: var(--accent);
      border-color: var(--accent);
      background-color: hsla(94deg, 99%, 33%, 0.2);
    }
  }
</style>
