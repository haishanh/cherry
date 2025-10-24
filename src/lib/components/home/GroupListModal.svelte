<script lang="ts">
  import { tick } from 'svelte';

  import { beforeNavigate } from '$app/navigation';
  import { groupListLoaded, groupListSorted } from '$lib/client/group.store';
  import Modal, { EVENT_TYPE } from '$lib/components/base/Modal.svelte';

  import Button from '../base/Button.svelte';
  import CherryLeaf from '../base/CherryLeaf.svelte';
  import Spinner from '../feedback/Spinner.svelte';
  import GroupChip from './GroupChip.svelte';
  import GroupFilterInput from './GroupFilterInput.svelte';
  import { PlusIcon } from '@lucide/svelte';

  type Group = { id: number; name: string; count?: number };
  type Props = {
    clickadd: () => void;
    itemAs?: 'link' | 'label';
    select?: (x: { group: Group }) => void;
  };

  let { clickadd, itemAs = 'link', select }: Props = $props();

  let modal: Modal;
  let filterText = $state('');

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
  function handlModalEvent0(_e: { type: EVENT_TYPE }) {
    tick().then(restore, restore);
  }

  let filteredGroupList = $derived($groupListSorted);

  $effect(() => {
    filteredGroupList = $groupListSorted.filter((item) => {
      return item.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
    });
  });

  function handleClickAdd() {
    clickadd();
  }
</script>

<Modal bind:this={modal} verticalAlign="start" ev0={handlModalEvent0}>
  <div class="wrap">
    <h2>Select Group</h2>

    {#if $groupListLoaded}
      <div class="input-wrap"><GroupFilterInput bind:value={filterText} /></div>
      {#if filteredGroupList.length > 0}
        <ul class="groups">
          {#each filteredGroupList as g (g.id)}
            <li><GroupChip group={g} {itemAs} {select} /></li>
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

  {#snippet footer()}
    <div class="footer">
      <Button onclick={handleClickAdd}>
        {#snippet icon()}
          <PlusIcon size={16} />
        {/snippet}
        <span>Create New</span>
      </Button>
    </div>
  {/snippet}
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
