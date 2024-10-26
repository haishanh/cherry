<script lang="ts">
  import { ChevronDown, Command, DownloadCloud, Info, Settings, UploadCloud, User } from 'lucide-svelte';
  import { afterNavigate } from '$app/navigation';
  import type { UserMe } from '$lib/type';

  export let pathname: string;
  export let user: UserMe;

  afterNavigate(() => {
    pathname = location.pathname;
  });

  const expanded: Record<string, boolean> = {
    // if user lands on a page like "/settings/admin/users", then we should expand nodes of "/settings/admin"
    '/settings/admin': pathname.startsWith('/settings/admin'),
  };

  function toggleExpandable(id: string) {
    expanded[id] = !expanded[id];
  }

  const trueFn = () => true;

  const links = [
    { href: '/settings/account', component: User, label: 'Account', display: trueFn },
    { href: '/settings/settings', component: Settings, label: 'Settings', display: trueFn },
    { href: '/settings/import', component: UploadCloud, label: 'Import', display: trueFn },
    { href: '/settings/export', component: DownloadCloud, label: 'Export', display: trueFn },
    {
      href: '/settings/admin',
      component: Command,
      label: 'Admin',
      display: (u: UserMe) => u?.attr?.admin,
      nodes: [
        // gonna hide this temporarily - 2024/02/24
        // { href: '/settings/admin/users', label: 'Users' },
        { href: '/settings/admin/backup', label: 'Backup' },
      ],
    },
    { href: '/settings/about', component: Info, label: 'About', display: trueFn },
  ].filter((l) => l.display(user));
</script>

<ul class="sidebar">
  {#each links as link (link.href)}
    {#if link.nodes}
      <li class:active={link.href === pathname}>
        <button class="link expand" on:click={() => toggleExpandable(link.href)}>
          <svelte:component this={link.component} size={16} />
          <span>{link.label}</span>
          <span class="arrow" class:isOpen={expanded[link.href]}>
            <ChevronDown size={16} />
          </span>
        </button>
        {#if expanded[link.href]}
          <ul class="nodes">
            {#each link.nodes as node (node.href)}
              <li class:active={node.href === pathname}>
                <span></span><a class="link" href={node.href}><span>{node.label}</span></a>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {:else}
      <li class:active={link.href === pathname}>
        <a class="link" href={link.href}
          ><svelte:component this={link.component} size={16} /><span>{link.label}</span></a
        >
      </li>
    {/if}
  {/each}
</ul>

<style lang="scss">
  ul {
    margin: 0;
    margin-bottom: 10px;
    padding: 0;
    min-width: 0;
    list-style: none;
  }
  .sidebar {
    --color-active: var(--accent);
    margin: 0;
    margin-bottom: 10px;
    padding: 0;
    min-width: 0;
    list-style: none;

    display: flex;
    flex-wrap: wrap;
    @media (prefers-color-scheme: dark) {
      --bo: hsl(0deg 0% 22%);
    }
    @media (prefers-color-scheme: light) {
      --bo: hsl(0deg 0% 86%);
    }
    @media (min-width: 768px) {
      display: block;
      margin-bottom: 0;
      border-right: 1px solid var(--bo);
      padding-right: 20px;
    }

    li {
      margin: 4px 0;
    }
  }
  .link {
    border-radius: 100px;
    padding: 8px 10px;
    color: inherit;
    text-decoration: none;
    align-items: center;
    display: grid;
    grid-template-columns: 16px 1fr;
    gap: 7px;
  }
  li.active .link {
    color: var(--color-active);
    background-color: hsl(94deg 99% 33% / 20%);
  }
  .link:hover {
    background-color: var(--bg-v2);
  }
  .expand {
    background-color: unset;
    border: unset;
    font-size: unset;
    cursor: pointer;
    grid-template-columns: 16px 1fr 16px;
  }
  .arrow {
    display: inline-flex;
    transform: rotate(0deg);
    transition: transform 0.3s;

    &.isOpen {
      transform: rotate(180deg);
    }
  }
  .nodes li {
    display: grid;
    gap: 7px;
    grid-template-columns: 16px max-content;
  }
  .nodes a {
    font-size: 14px;
    grid-template-columns: 1fr;
  }
</style>
