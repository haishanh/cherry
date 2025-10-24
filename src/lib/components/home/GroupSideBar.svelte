<script lang="ts">
  import { Folder } from '@lucide/svelte';
  import { onMount } from 'svelte';

  import { afterNavigate } from '$app/navigation';
  import { fetchGroups, fetchPromise as groupFetched, groupMapById } from '$lib/client/group.store';
  import { groupAddModal, groupDeleteConfirmModal, groupListModal } from '$lib/client/modal.store';
  import Button from '$lib/components/base/Button.svelte';
  import GroupAddModal from '$lib/components/home/GroupAddModal.svelte';
  import GroupDeleteConfirmModal from '$lib/components/home/GroupDeleteConfirmModal.svelte';
  import GroupListModal from '$lib/components/home/GroupListModal.svelte';
  import { findFirstInList } from '$lib/utils/common.util';

  import Tooltip from '../base/popover/Tooltip.svelte';
  import VisuallyHidden from '../base/VisuallyHidden.svelte';

  onMount(() => {
    fetchGroups({ initial: true });
  });

  let groupAddModal0: GroupAddModal;
  let groupListModal0: GroupListModal;
  let groupDeleteConfirmModal0: GroupDeleteConfirmModal;

  $effect(() => {
    groupAddModal.set(groupAddModal0);
  });
  $effect(() => {
    groupListModal.set(groupListModal0);
  });
  $effect(() => {
    groupDeleteConfirmModal.set(groupDeleteConfirmModal0);
  });

  function open() {
    $groupListModal?.open();
  }

  type Props = {
    pathname?: string;
    groupId?: number | null;
  };
  let { pathname = '/settings/about', groupId = null }: Props = $props();

  afterNavigate(() => {
    loadLastViewdLinks();

    pathname = location.pathname;
    const u = new URL(location.href);
    const g = u.searchParams.get('group');
    if (g) {
      groupId = parseInt(g, 10);
      saveLastViewdGroupId(groupId);
    } else {
      groupId = null;
    }
  });

  const LAST_VIEWED_GROUPS_STORAGE_KEY = 'cherry:groups';

  function loadLastViewdGroupIds() {
    try {
      const v = localStorage.getItem(LAST_VIEWED_GROUPS_STORAGE_KEY);
      if (!v) return [];
      const items = JSON.parse(v);
      return items || [];
    } catch (e) {
      // ignore
    }
    return [];
  }

  function saveLastViewdGroupId(groupId: number) {
    const items = loadLastViewdGroupIds();
    if (items.indexOf(groupId) >= 0) return;
    items.push(groupId);
    try {
      localStorage.setItem(LAST_VIEWED_GROUPS_STORAGE_KEY, JSON.stringify(items.slice(items.length - 20)));
    } catch (e) {
      // ignore
    }
  }

  type GroupLinkItem = { href: string; label: string; groupId: number | null };
  const fixedLinks: GroupLinkItem[] = [{ href: '/', label: 'All', groupId: null }];

  let lastViewedLinks: GroupLinkItem[] = $state([]);

  function buildGroupLinkItem(group: { id: number; name: string }) {
    return { href: '/?group=' + group.id, label: group.name, groupId: group.id };
  }

  function loadLastViewdLinks() {
    const groupIds = loadLastViewdGroupIds();
    const len = groupIds.length;
    for (let i = len - 1; i >= 0 && lastViewedLinks.length < 3; i--) {
      const group = $groupMapById.get(groupIds[i]);
      if (group) {
        const item = findFirstInList(lastViewedLinks, (l) => l.groupId === group.id);
        if (item) continue;
        lastViewedLinks.push(buildGroupLinkItem(group));
      }
    }

    lastViewedLinks = lastViewedLinks.slice(0, 3);
    ensureLinkInList(activeLinkItem);
  }

  function ensureLinkInList(link: GroupLinkItem) {
    if (link && !findFirstInList(lastViewedLinks, (l) => l.groupId === link.groupId)) {
      const links = [link, ...lastViewedLinks];
      lastViewedLinks = links.slice(0, 3);
    }
  }

  onMount(() => {
    groupFetched.then(() => {
      loadLastViewdLinks();
    });
  });

  let activeLinkItem: GroupLinkItem;

  $effect(() => {
    if (typeof groupId === 'number' && groupId !== 0) {
      const group = $groupMapById.get(groupId);
      if (group) {
        activeLinkItem = buildGroupLinkItem(group);
        ensureLinkInList(activeLinkItem);
      }
    }
  });

  function handleClickAdd() {
    $groupAddModal?.open();
  }
</script>

<div class="wrap">
  <div class="title"><h3>Groups</h3></div>
  <ul class="sidebar">
    {#each fixedLinks as link (link.href)}
      <li>
        <a class="link" class:active={link.groupId === groupId} href={link.href}><span>{link.label}</span></a>
      </li>
    {/each}
    {#each lastViewedLinks as link (link.href)}
      <li>
        <a class="link" class:active={link.groupId === groupId} href={link.href}><span>{link.label}</span></a>
      </li>
    {/each}
    <li class="btn-wrap">
      <Tooltip>
        {#snippet trigger()}
          <Button modifier={['minimal']} style="padding:8px 10px" onclick={open}>
            {#snippet icon()}
              <Folder size={15} />
            {/snippet}
            <VisuallyHidden>Show more groups</VisuallyHidden>
          </Button>
        {/snippet}
        {#snippet content()}
          <div class="tooltip-cnt">Show more groups</div>
        {/snippet}
      </Tooltip>
    </li>
  </ul>
</div>

<GroupListModal bind:this={groupListModal0} itemAs="link" clickadd={handleClickAdd} />
<GroupAddModal bind:this={groupAddModal0} />
<GroupDeleteConfirmModal bind:this={groupDeleteConfirmModal0} />

<style lang="scss">
  .wrap {
    --color-active: var(--accent);
    font-size: 0.9em;
    padding: 0 25px 10px;
    min-width: 0;
    .title {
      display: none;
      padding: 0 10px;
    }
    @media (min-width: 1200px) {
      padding: 90px 10px 10px 0;
      .title {
        display: block;
      }
    }
    h3 {
      color: var(--color-text2);
      font-size: 1em;
      margin: 0 0 5px;
      font-weight: normal;
    }
  }

  .sidebar {
    margin: 0;
    padding: 0;
    min-width: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    @media (prefers-color-scheme: dark) {
      --bo: hsl(0deg 0% 22%);
    }
    @media (prefers-color-scheme: light) {
      --bo: hsl(0deg 0% 86%);
    }
    @media (min-width: 1200px) {
      display: block;
      margin-bottom: 0;
    }

    li {
      display: flex;
      align-items: center;

      @media (min-width: 1200px) {
        display: block;
        margin-bottom: 0;
        margin-bottom: 5px;
      }
      .link {
        flex: 1;
        min-width: 0;
        span {
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .btn-wrap {
      @media (min-width: 1200px) {
        display: none;
      }
    }
  }
  .wrap:hover .btn-wrap {
    display: inline-flex;
  }
  .link {
    border-radius: 100px;
    padding: 8px 10px;
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 7px;
    &.active {
      color: var(--color-active);
      background-color: hsl(94deg 99% 33% / 20%);
    }
    &:hover {
      background-color: var(--bg-v2);
    }
    @media (min-width: 1200px) {
      padding: 8px 10px;
    }
  }
  .tooltip-cnt {
    font-size: 0.85em;
  }
</style>
