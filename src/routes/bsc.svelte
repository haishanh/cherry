<script lang="ts">
  let sites = [
    {
      title: 'BSC',
      // prettier-ignore
      children: [
        { href: 'https://pancakeswap.finance/pools', label: 'PancakeSwap', icon: 'https://pbs.twimg.com/profile_images/1509982580241747971/7WcNPK8y_400x400.jpg' },
        { href: 'https://app.alpacafinance.org/farm', label: 'Alpaca', icon: 'https://pbs.twimg.com/profile_images/1481749291379081217/KGzK2UQS_400x400.png' },
        { href: 'https://app.beefy.com/#/', label: 'Beefy', icon: 'https://pbs.twimg.com/profile_images/1515317478095785984/D458ZCFj_400x400.jpg' },
        { href: 'https://exchange.biswap.org/#/swap', label: 'Biswap', icon: 'https://pbs.twimg.com/profile_images/1481634082496806914/rXUu-spA_400x400.jpg' },
        { href: 'https://apeswap.finance/swap', label: 'ApeSwap', icon: 'https://pbs.twimg.com/profile_images/1513952213890174984/uSztZAUV_400x400.jpg' },
      ],
    },
    {
      title: 'Solana',
      // prettier-ignore
      children: [
        { href: 'https://www.orca.so/pools', label: 'Orca', icon: 'https://learn.orca.so/static/media/logomark.1ef55f8f.svg' },
        { href: 'https://francium.io/app/invest/farm', label: 'Francium', icon: 'https://solana.com/_next/image?url=%2Fapi%2Fprojectimg%2Fckwgwh7n529473eysxc32d05ww%3Ftype%3DLOGO&w=3840&q=75' },
        { href: 'https://raydium.io/swap', label: 'Raydium', icon: 'https://solana.com/_next/image?url=%2Fapi%2Fprojectimg%2Fckwgwiiri37677eysxluqnog8e%3Ftype%3DLOGO&w=3840&q=75' },
        { href: 'https://app.saber.so/', label: 'Saber', icon: 'https://pbs.twimg.com/profile_images/1406719335679369233/oYs_YFz8_400x400.jpg' },
        { href: 'https://solend.fi/dashboard', label: 'Solend', icon: 'https://pbs.twimg.com/profile_images/1479918591718064128/mjL4FpQU_400x400.jpg' },
      ],
    },
    {
      // https://awesomenear.com/
      title: 'Near',
      // prettier-ignore
      children: [
        { href: 'https://app.aurigami.finance/', label: 'Aurigami', icon: 'https://awesome-near.s3.amazonaws.com/aurigami.jpg' },
        { href: 'https://app.ref.finance/', label: 'Ref', icon: 'https://awesome-near.s3.amazonaws.com/ref-finance.jpg' },
        { href: 'https://www.trisolaris.io/#/swap', label: 'Trisolaris', icon: 'https://awesome-near.s3.amazonaws.com/trisolaris.jpg' },
        { href: 'https://app.bastionprotocol.com/', label: 'Bastion', icon: 'https://pbs.twimg.com/profile_images/1510144576794865664/a97MN4x7_400x400.jpg' },
      ],
    },
  ];
</script>

<div class="main">
  {#each sites as s}
    <section>
      <h2>{s.title}</h2>
      <div class="list">
        {#each s.children as l}
          <a href={l.href} target="_blank" rel="noopener noreferrer">
            <img src={l.icon} alt={'logo of ' + l.label} />
            {l.label}
          </a>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style lang="scss">
  .main {
    max-width: 1000px;
    padding: 15px;
    margin: 0 auto;
    section {
      padding: 10px 0;
    }
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    a {
      text-decoration: none;
      color: inherit;
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: var(--bg-card);
      padding: 10px;
      border-radius: 300px;
    }
    img {
      width: 40px;
      height: 40px;
      border-radius: 300px;
    }
  }
</style>
