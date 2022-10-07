<script lang="ts">
  import Folder from '@hsjs/svelte-icons/feather/Folder.svelte';
  import { onMount } from 'svelte';

  import { afterNavigate } from '$app/navigation';
  import { fetchGroups, fetchPromise as groupFetched, groupMapById } from '$lib/client/group.store';
  import { groupAddModal, groupDeleteConfirmModal, groupListModal } from '$lib/client/modal.store';
  import Button from '$lib/components/base/Button.svelte';
  import GroupAddModal from '$lib/components/home/GroupAddModal.svelte';
  import GroupDeleteConfirmModal from '$lib/components/home/GroupDeleteConfirmModal.svelte';
  import GroupListModal from '$lib/components/home/GroupListModal.svelte';
  import { findFirstInList } from '$lib/utils/common.util';
  import VisuallyHidden from '../base/VisuallyHidden.svelte';
  import Tooltip from '../base/popover/Tooltip.svelte';

  onMount(() => {
    fetchGroups({ initial: true });
  });

  let groupAddModal0: GroupAddModal;
  let groupListModal0: GroupListModal;
  let groupDeleteConfirmModal0: GroupDeleteConfirmModal;
  $: groupAddModal.set(groupAddModal0);
  $: groupListModal.set(groupListModal0);
  $: groupDeleteConfirmModal.set(groupDeleteConfirmModal0);

  function open() {
    $groupListModal?.open();
  }

  export let pathname = '/settings/about';
  export let groupId: number | null = null;

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
  const fixedLinks = [
    { href: '/', label: 'All', groupId: null },
    // { href: '/?group=0', label: 'Ungrouped', groupId: 0 },
  ];

  // let links = fixedLinks;
  let lastViewedLinks: typeof fixedLinks = [];

  // $: {
  //   console.log(links.map((n) => n.label).join(','));
  //   console.log(lastViewedLinks.map((n) => n.label).join(','));
  // }

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

  $: {
    if (typeof groupId === 'number' && groupId !== 0) {
      const group = $groupMapById.get(groupId);
      if (group) {
        activeLinkItem = buildGroupLinkItem(group);
        ensureLinkInList(activeLinkItem);
      }
    }
  }

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
        <Button slot="trigger" modifier={['minimal']} style="padding:8px 10px" on:click={open}>
          <Folder slot="icon" size={15} />
          <VisuallyHidden>Show more groups</VisuallyHidden>
        </Button>
        <div class="tooltip-cnt" slot="content">Show more groups</div>
      </Tooltip>
    </li>
  </ul>
</div>

<GroupListModal bind:this={groupListModal0} itemAs="link" on:clickadd={handleClickAdd} />
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
      span {
        font-size: 0.9em;
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
