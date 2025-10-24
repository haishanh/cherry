<script lang="ts" module>
  export type DockOperation = 'delete' | 'cancel';
</script>

<script lang="ts">
  import { Folder, Trash, XIcon } from '@lucide/svelte';

  import { groupSelectModal } from '$lib/client/modal.store';
  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

  type Props = {
    ondock: (event: { op: DockOperation }) => void;
    count: number;
  };

  let { ondock, count }: Props = $props();

  function handleClickDelete(_e: MouseEvent) {
    ondock({ op: 'delete' });
  }
  function handleClickCancel(_e: MouseEvent) {
    ondock({ op: 'cancel' });
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
      {#snippet icon()}
        <Folder size={16} />
      {/snippet}
    </Button>
    <Button modifier={['icon']} onclick={handleClickDelete}>
      <VisuallyHidden>Delete</VisuallyHidden>
      <Trash size={16} /><span class="btn-label"><kbd>SHIFT</kbd> + <kbd>3</kbd></span>
    </Button>
    <Button modifier={['icon']} onclick={handleClickCancel}>
      <VisuallyHidden>Cancel</VisuallyHidden>
      <XIcon size={16} /><span class="btn-label"><kbd>ESC</kbd></span>
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
      --shadow:
        inset 0 -2px 0 0 hsl(0deg 0% 20%), inset 0 0 1px 1px hsl(0deg 0% 21%), 0 2px 2px 0 hsl(0deg 0% 11% / 69%);
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
