<script lang="ts">
  import { deleteTagClientSide } from '$lib/client/tag.store';

  type Props = {
    tag: { name: string; id: number; count?: number };
    tagVariantTotal?: number;
    editModal?: TagEditModal;
  };

  let { tag, tagVariantTotal = 4, editModal }: Props = $props();

  import type TagEditModal from '$lib/components/tag/TagEditModal.svelte';
  import { request } from '$lib/utils/http.util';

  import Popover from './base/popover/Popover.svelte';
  import { addToast } from './base/toast/store';
  import PopoverAction from './bookmark-chip/PopoverAction.svelte';

  let anchor: HTMLElement | null = $state(null);
  let isOpen = $state(false);
  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;

  async function deleteTag(tag: { id: number }) {
    const id = tag.id;
    let ret = await request({ url: '/api/tags/' + id, method: 'DELETE' });
    return ret.data;
  }

  function openEditModal() {
    closePopup();
    editModal?.open({ tag });
  }

  function deferOpen(delay = 700) {
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    if (isOpen) return;
    if (openTimeoutId) clearTimeout(openTimeoutId);

    openTimeoutId = setTimeout(() => {
      if (!isOpen) isOpen = true;
    }, delay);
  }
  function deferClose(delay = 750) {
    if (openTimeoutId) clearTimeout(openTimeoutId);
    if (!isOpen) return;

    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(() => {
      if (isOpen) isOpen = false;
    }, delay);
  }
  function closePopup() {
    isOpen = false;
  }
  function handleItemOnMouseEnter() {
    deferOpen(700);
  }
  function handleItemOnMouseLeave() {
    deferClose(750);
  }
  function handlePopoverOnMouseEnter() {
    deferOpen(700);
  }
  function handlePopoverOnMouseLeave() {
    deferClose(750);
  }
  async function handleDelete() {
    try {
      await deleteTag(tag);
      deleteTagClientSide(tag);
      addToast({ description: 'Tag deleted successfully', status: 'success' });
    } catch (e) {
      console.log('Delete tag failed', e);
      addToast({ description: 'Something went wrong', status: 'error' });
    }
  }
  function handleEdit() {
    openEditModal();
  }
</script>

<a
  class:isOpen
  class="tag"
  href="/?tag={tag.id}"
  class:v_0={tag.id % tagVariantTotal === 0}
  class:v_1={tag.id % tagVariantTotal === 1}
  class:v_2={tag.id % tagVariantTotal === 2}
  bind:this={anchor}
  onmouseenter={handleItemOnMouseEnter}
  onmouseleave={handleItemOnMouseLeave}
>
  {tag.name}
  {#if typeof tag.count === 'number' && tag.count >= 0}
    <span class="badge">{tag.count}</span>
  {/if}
</a>

<Popover
  bind:isOpen
  {anchor}
  close={closePopup}
  mouseenter0={handlePopoverOnMouseEnter}
  mouseleave0={handlePopoverOnMouseLeave}
>
  <div class="popover-wrap">
    <PopoverAction onclose={closePopup} ondelete={handleDelete} onedit={handleEdit} />
  </div>
</Popover>

<style lang="scss">
  .tag {
    border-radius: 100px;
    padding: 6px 7px 6px 13px;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    --fg: var(--text-v3);
    color: var(--fg);

    &.isOpen {
      border-color: hsl(0deg 0% var(--lightness));
      @media (prefers-color-scheme: dark) {
        --lightness: 30%;
      }
      @media (prefers-color-scheme: light) {
        --lightness: 50%;
      }
    }

    @media (prefers-color-scheme: dark) {
      border-color: hsl(0deg 0% 31%);
    }
    @media (prefers-color-scheme: light) {
      border-color: hsl(0deg 0% 75%);
    }

    &:hover {
      --fg: hsl(94deg 100% 27%);
      background: hsl(94deg 100% 27% / 8%);
      .badge {
        background: hsl(94deg 100% 27% / 70%);
      }
    }
    .badge {
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

  // .v0 { color: hsl(350deg 80% 20%); background: hsl(350deg 80% 93%); }
  // .v1 { color: hsl(210deg 80% 55%); background: hsl(210deg 80% 89%); }
  // .v2 { color: hsl(22deg 80% 40%); background: hsl(22deg 80% 90%); }
  // .v3 { color: #14551b; background: #adf29b; }
</style>
