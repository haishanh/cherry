<script lang="ts">
  import { groupAddModal, groupDeleteConfirmModal } from '$lib/client/modal.store';
  import Button from '$lib/components/base/Button.svelte';
  import { SquarePen, TrashIcon } from '@lucide/svelte';

  type Group = { id: number; name: string; count?: number };
  type Props = {
    select?: (x: { group: Group }) => void;
    group: Group;
    itemAs?: 'link' | 'label';
  };

  let { select, group, itemAs = 'link' }: Props = $props();

  function handleClickEdit() {
    $groupAddModal?.open(group);
  }

  function handleClickDelete() {
    $groupDeleteConfirmModal?.open(group);
  }

  let isOpen = $state(false);
  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;

  function open() {
    if (!isOpen) isOpen = true;
  }
  function close() {
    if (isOpen) isOpen = false;
  }
  function deferOpen(delay = 700) {
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    if (isOpen) return;
    if (openTimeoutId) clearTimeout(openTimeoutId);
    openTimeoutId = setTimeout(open, delay);
  }
  function deferClose(delay = 750) {
    if (openTimeoutId) clearTimeout(openTimeoutId);
    if (!isOpen) return;
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(close, delay);
  }
  function handleItemOnMouseEnter() {
    deferOpen(350);
  }
  function handleItemOnMouseLeave() {
    deferClose(400);
  }

  function handleClickLabel() {
    select?.({ group });
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class="root" onmouseenter={handleItemOnMouseEnter} onmouseleave={handleItemOnMouseLeave}>
  {#if itemAs === 'link'}
    <a class="link" href={'/?group=' + group.id}>
      <span>{group.name}</span><span class="count">{group.count}</span>
    </a>
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <span class="link" onclick={handleClickLabel}>
      <span>{group.name}</span><span class="count">{group.count}</span>
    </span>
  {/if}
  <span class="edit" class:isOpen>
    <Button modifier={['p5']} onclick={handleClickEdit}>
      <SquarePen size={12} />
    </Button>
  </span>
  <span class="delete" class:isOpen>
    <Button modifier={['p5']} onclick={handleClickDelete}>
      <TrashIcon size={12} />
    </Button>
  </span>
</span>

<style lang="scss">
  .root {
    position: relative;
    display: inline-flex;
  }
  .edit {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
  }
  .delete {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
  }
  .edit.isOpen,
  .delete.isOpen {
    display: inline;
  }
  .link {
    border-radius: 100px;
    padding: 8px 10px;
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 7px;
    background-color: var(--bg);
    cursor: pointer;
    &:hover {
      color: var(--accent);
      background-color: hsla(94deg, 99%, 33%, 0.2);
    }

    .count {
      font-size: 0.8em;
      min-width: 18px;
      height: 18px;
      padding: 0px 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      @media (prefers-color-scheme: dark) {
        background-color: hsla(94deg, 99%, 33%, 0.5);
        color: #c5c5c5;
      }
      @media (prefers-color-scheme: light) {
        background-color: hsla(94deg, 99%, 33%, 0.5);
        color: #fff;
      }
    }

    @media (prefers-color-scheme: dark) {
      --bg: hsl(0deg 0% 27%);
    }
    @media (prefers-color-scheme: light) {
      --bg: hsl(0deg 0% 95%);
    }
  }
</style>
