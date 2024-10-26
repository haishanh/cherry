<script lang="ts">
  export let itemAs: 'link' | 'label' = 'link';

  import Plus from '@hsjs/svelte-icons/feather/Plus.svelte';
  import { createEventDispatcher, tick } from 'svelte';

  import { beforeNavigate } from '$app/navigation';
  import { groupListLoaded, groupListSorted } from '$lib/client/group.store';
  import Modal, { EVENT_TYPE } from '$lib/components/base/Modal.svelte';

  import Button from '../base/Button.svelte';
  import CherryLeaf from '../base/CherryLeaf.svelte';
  import Spinner from '../feedback/Spinner.svelte';
  import GroupChip from './GroupChip.svelte';
  import GroupFilterInput from './GroupFilterInput.svelte';

  const dispatch = createEventDispatcher();

  const EVENT = {
    clickadd: 'clickadd',
  };

  let modal: Modal;
  let filterText = '';

  function restore() {
    filterText = '';
  }

  beforeNavigate(() => {
    close();
  });

  export const open = () => {
    modal.open();
  };
  export const close = () => {
    modal.close();
  };
  function handlModalEvent0(_e: CustomEvent<{ type: EVENT_TYPE }>) {
    tick().then(restore, restore);
  }

  let filteredGroupList = $groupListSorted;
  $: {
    filteredGroupList = $groupListSorted.filter((item) => {
      return item.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
    });
  }

  function handleClickAdd() {
    dispatch(EVENT.clickadd);
  }
</script>

<Modal bind:this={modal} verticalAlign="start" on:ev0={handlModalEvent0}>
  <div class="wrap">
    <h2>Select Group</h2>

    {#if $groupListLoaded}
      <div class="input-wrap"><GroupFilterInput bind:value={filterText} /></div>
      {#if filteredGroupList.length > 0}
        <ul class="groups">
          {#each filteredGroupList as g (g.id)}
            <li><GroupChip group={g} {itemAs} on:select /></li>
          {/each}
        </ul>
      {:else}
        <div class="empty">
          <p>No groups yet</p>
          <div>
            <CherryLeaf />
          </div>
        </div>
      {/if}
    {:else}
      <div class="loading"><Spinner /></div>
    {/if}
  </div>

  <div slot="footer" class="footer">
    <Button onclick={handleClickAdd}>
      <Plus slot="icon" size={16} />
      <span>Create New</span>
    </Button>
  </div>
</Modal>

<style lang="scss">
  .wrap {
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }
  .empty {
    text-align: center;
    p {
      margin: 20px 0 0;
    }
  }
  h2 {
    padding: 0 10px;
    margin-top: 8px;
  }
  .footer {
    padding: 0 26px 16px;
    gap: 5px;
  }
  .loading {
    padding: 30px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .groups {
    list-style: none;
    margin: 0;
    padding: 16px 12px;

    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    flex: 1 1 0%;
    overflow-y: auto;
  }
</style>
