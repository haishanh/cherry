<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import Cherry from '$lib/components/base/Cherry.svelte';
  import Dice from '$lib/components/base/icons/Dice.svelte';
  import { SettingsIcon, TagIcon } from '@lucide/svelte';

  let randomCount = $state(0);
  afterNavigate(() => {
    if (window.URL) {
      const u = new URL(location.href);
      const r0 = u.searchParams.get('r');
      if (!r0) return;
      const r = parseInt(r0, 10);
      if (isNaN(r)) return;
      randomCount = r + 1;
    }
  });
</script>

<header>
  <a href="/"><Cherry size={40} /></a>
  <ul>
    <li><a href="/tags"><TagIcon size={18} /><span>Tags</span></a></li>
    <li><a href="/?random&r={randomCount}"><Dice size={18} /><span>Random</span></a></li>
    <li><a href="/settings/account"><SettingsIcon size={18} /><span>Settings</span></a></li>
  </ul>
</header>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px 0;
    font-size: 0.9em;
    @media (min-width: 640px) {
      padding: 10px 40px 0;
      font-size: 1em;
    }
    @media (min-width: 1024px) {
      padding: 10px 40px;
    }
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
    li {
      margin: 0 -1px;
    }
    li a {
      text-decoration: none;
      color: inherit;
      display: flex;
      align-items: center;
      padding: 5px 7px;
      border-radius: 40px;
      &:hover {
        color: var(--accent);
        background-color: hsla(94deg, 99%, 33%, 0.2);
      }
      span {
        margin-left: 5px;
      }
    }
  }
</style>
