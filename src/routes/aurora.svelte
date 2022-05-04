<script lang="ts">
  // import { amp, browser, dev, mode, prerendering } from '$app/env';
  let links = [
    { href: 'https://app.aurigami.finance/', content: 'aurigami' },
    { href: 'https://www.trisolaris.io/#/swap', content: 'trisolaris' },
    { href: 'https://app.bastionprotocol.com/', content: 'bastion' },
  ];
</script>

<section>
  {#each links as l}
    <a href={l.href} target="_blank" rel="noopener noreferrer">{l.content}</a>
  {/each}
</section>

<style lang="scss">
  section {
    padding: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    a {
      text-decoration: none;
      background-color: hsl(45, 100%, 50%);
      color: black;
      padding: 8px 15px;
      border-radius: 100px;
    }
  }
</style>
