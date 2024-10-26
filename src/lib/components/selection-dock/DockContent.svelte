<script lang="ts">
  export let count: number;

  const EVENT = {
    dock: 'dock',
  };

  import Folder from '@hsjs/svelte-icons/feather/Folder.svelte';
  import Trash from '@hsjs/svelte-icons/feather/Trash.svelte';
  import CloseIcon from '@hsjs/svelte-icons/feather/XCircle.svelte';
  import { createEventDispatcher } from 'svelte';

  import { groupSelectModal } from '$lib/client/modal.store';
  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

  const dispatch = createEventDispatcher();

  function handleClickDelete(_e: MouseEvent) {
    dispatch(EVENT.dock, { op: 'delete' });
  }
  function handleClickCancel(_e: MouseEvent) {
    dispatch(EVENT.dock, { op: 'cancel' });
  }
  function handleClickGrouping() {
    $groupSelectModal?.open();
  }
</script>

<div class="dock">
  <p>{count} selected</p>
  <div class="btn-group">
    <Button onclick={handleClickGrouping}>
      <span class="btn-text">Group</span>
      <Folder slot="icon" size={16} />
    </Button>
    <Button modifier={['icon']} onclick={handleClickDelete}>
      <VisuallyHidden>Delete</VisuallyHidden>
      <Trash size={16} /><span class="btn-label"><kbd>SHIFT</kbd> + <kbd>3</kbd></span>
    </Button>
    <Button modifier={['icon']} onclick={handleClickCancel}>
      <VisuallyHidden>Cancel</VisuallyHidden>
      <CloseIcon size={16} /><span class="btn-label"><kbd>ESC</kbd></span>
    </Button>
  </div>
</div>

<style lang="scss">
  .dock {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .btn-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  p {
    margin: 0;
  }
  kbd {
    background: var(--bg);
    box-shadow: var(--shadow);
    border-radius: 3px;
    position: relative;
    top: -1px;
    display: inline-block;
    font-size: 0.7em;
    font-family: var(--fmono);
    line-height: 1;
    padding: 3px 5px;
    white-space: nowrap;
    @media (prefers-color-scheme: dark) {
      --bg: #3b4046;
      --shadow: inset 0 -2px 0 0 hsl(0deg 0% 20%), inset 0 0 1px 1px hsl(0deg 0% 21%),
        0 2px 2px 0 hsl(0deg 0% 11% / 69%);
    }
    @media (prefers-color-scheme: light) {
      --bg: linear-gradient(-225deg, #d5dbe4, #f8f8f8);
      --shadow: inset 0 -2px 0 0 hsl(0deg 0% 77%), inset 0 0 1px 1px #fff, 0 1px 2px 1px hsl(0deg 0% 60% / 70%);
    }
  }
  .btn-label {
    margin-left: 5px;
  }
  .btn-text {
    font-size: 0.87em;
  }
</style>
