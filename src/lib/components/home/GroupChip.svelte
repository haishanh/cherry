<script lang="ts">
  export let group: { id: number; name: string; count?: number };
  export let itemAs: 'link' | 'label' = 'link';

  import Edit from '@hsjs/svelte-icons/feather/Edit.svelte';
  import Trash from '@hsjs/svelte-icons/feather/Trash.svelte';
  import { createEventDispatcher } from 'svelte';

  import { groupAddModal, groupDeleteConfirmModal } from '$lib/client/modal.store';
  import Button from '$lib/components/base/Button.svelte';

  const dispatch = createEventDispatcher();

  const EVENT = {
    select: 'select',
  };

  function handleClickEdit() {
    $groupAddModal?.open(group);
  }

  function handleClickDelete() {
    $groupDeleteConfirmModal?.open(group);
  }

  let isOpen = false;
  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;

  function open() {
    if (!isOpen) isOpen = true;
  }
  function close() {
    if (isOpen) isOpen = false;
  }
  function deferOpen(delay = 700) {
    closeTimeoutId && clearTimeout(closeTimeoutId);
    if (isOpen) return;
    openTimeoutId && clearTimeout(openTimeoutId);
    openTimeoutId = setTimeout(open, delay);
  }
  function deferClose(delay = 750) {
    openTimeoutId && clearTimeout(openTimeoutId);
    if (!isOpen) return;
    closeTimeoutId && clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(close, delay);
  }
  function handleItemOnMouseEnter() {
    deferOpen(350);
  }
  function handleItemOnMouseLeave() {
    deferClose(400);
  }

  function handleClickLabel() {
    dispatch(EVENT.select, { group });
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span class="root" on:mouseenter={handleItemOnMouseEnter} on:mouseleave={handleItemOnMouseLeave}>
  {#if itemAs === 'link'}
    <a class="link" href={'/?group=' + group.id}>
      <span>{group.name}</span><span class="count">{group.count}</span>
    </a>
  {:else}
    <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
    <span class="link" on:click={handleClickLabel}>
      <span>{group.name}</span><span class="count">{group.count}</span>
    </span>
  {/if}
  <span class="edit" class:isOpen>
    <Button modifier={['p5']} on:click={handleClickEdit}>
      <Edit size={12} />
    </Button>
  </span>
  <span class="delete" class:isOpen>
    <Button modifier={['p5']} on:click={handleClickDelete}>
      <Trash size={12} />
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
    @media (prefers-color-scheme: dark) {
      --bg: hsl(0deg 0% 27%);
    }
    @media (prefers-color-scheme: light) {
      --bg: hsl(0deg 0% 95%);
    }
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
  }
</style>
