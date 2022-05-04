<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async (input) => {
    const fetch = input.fetch;

    const res = await fetch('/api/gecko');

    if (res.ok) {
      const markets = await res.json();
      return { props: { markets } };
    }

    return {
      status: res.status,
      error: new Error(`Could not load`),
    };
  };
</script>

<script lang="ts">
  import type { Market2 } from '$lib/types';

  const geckoCoinLinkBase = 'https://www.coingecko.com/en/coins/';

  export let markets: Market2[] = [];
</script>

<section>
  {#each markets as m, idx}
    <span class="item" class:even={idx % 2 === 0}>
      <a href={geckoCoinLinkBase + m.id} target="_blank" rel="noopener noreferrer">
        {m.symbol.toLowerCase()}
      </a>
    </span>
    <span class="item number" class:even={idx % 2 === 0}>{m.p}</span>
    <span class="item number" class:even={idx % 2 === 0} class:dim={m.p1h < 0}>{m.p1h}</span>
    <span class="item number" class:even={idx % 2 === 0} class:dim={m.p24h < 0}>{m.p24h}</span>
    <span class="item number" class:even={idx % 2 === 0} class:dim={m.p7d < 0}>{m.p7d}</span>
  {/each}
</section>

<style lang="scss">
  section {
    display: grid;
    grid-template-columns: repeat(5, minmax(2rem, 1fr));
    max-width: 375px;
    margin: 0 auto;

    @media (prefers-color-scheme: dark) {
      --bg-even: #333;
      --dim: #555;
    }
    @media (prefers-color-scheme: light) {
      --bg-even: #eee;
      --dim: #aaa;
    }
  }

  .item {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    font-size: 0.9em;

    a {
      text-decoration: none;
      color: inherit;
    }
  }
  .even {
    background-color: var(--bg-even);
  }
  .dim {
    color: var(--dim);
  }
  .number {
    font-family: var(--fmono);
    font-size: 0.8em;
  }
</style>
