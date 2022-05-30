<script lang="ts">
  import Info from '@hsjs/svelte-icons/feather/Info.svelte';
  import Settings from '@hsjs/svelte-icons/feather/Settings.svelte';
  import UploadCloud from '@hsjs/svelte-icons/feather/UploadCloud.svelte';
  import User from '@hsjs/svelte-icons/feather/User.svelte';

  import { afterNavigate } from '$app/navigation';

  export let pathname: string;

  afterNavigate(() => {
    pathname = location.pathname;
  });

  const links = [
    { href: '/settings/account', component: User, label: 'Account' },
    { href: '/settings/settings', component: Settings, label: 'Settings' },
    { href: '/settings/import', component: UploadCloud, label: 'Import' },
    { href: '/settings/about', component: Info, label: 'About' },
  ];
</script>

<ul class="sidebar">
  {#each links as link (link.href)}
    <li class:active={link.href === pathname}>
      <a class="link" href={link.href}><svelte:component this={link.component} size={16} /><span>{link.label}</span></a>
    </li>
  {/each}
</ul>

<style lang="scss">
  .sidebar {
    // --color-active: #49a501;
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
    display: flex;
    align-items: center;
    gap: 7px;
  }
  li.active .link {
    color: var(--color-active);
    background-color: hsl(94deg 99% 33% / 20%);
  }
  li:hover .link {
    background-color: var(--bg-v2);
  }
</style>
