<script lang="ts">
  const chainId = 56;
  // bscscan token address
  // https://bscscan.com/token/0x3019BF2a2eF8040C242C9a4c5c4BD4C81678b2A1

  // token list
  // https://tokenlists.org/token-list?url=https://tokens.pancakeswap.finance/pancakeswap-top-100.json
  // https://tokenlists.org/token-list?url=https://tokens.pancakeswap.finance/pancakeswap-extended.json
  // https://tokenlists.org/token-list?url=https://tokens.pancakeswap.finance/coingecko.json

  // import { amp, browser, dev, mode, prerendering } from '$app/env';
  const tokens = [
    {
      name: 'GMT',
      symbol: 'GMT',
      address: '0x3019BF2a2eF8040C242C9a4c5c4BD4C81678b2A1',
      chainId,
      decimals: 8,
      image: 'https://tokens.pancakeswap.finance/images/0x3019BF2a2eF8040C242C9a4c5c4BD4C81678b2A1.png',
    },
    {
      name: 'Alpaca',
      symbol: 'ALPACA',
      address: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F',
      chainId,
      decimals: 18,
      image: 'https://tokens.pancakeswap.finance/images/0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F.png',
    },
    {
      chainId,
      address: '0x55671114d774ee99D653D6C12460c780a67f1D18',
      name: 'Pacoca',
      symbol: 'PACOCA',
      decimals: 18,
      image: 'https://pacoca.io/pacoca-token-logo.png',
      // https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/PACOCA.svg
    },
  ];
  async function addToMetamask(token: any) {
    if (window.ethereum) {
      const tokenAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image,
          },
        },
      });
      console.log(tokenAdded);
    }
  }
</script>

<ul>
  {#each tokens as token}
    <li>
      <div class="token-card">
        <div>
          <img src={token.image} alt="token cover" />
        </div>
        <div class="footer">
          <span>{token.symbol}</span>
          <a href={'https://bscscan.com/token/' + token.address} target="_blank" rel="noopener noreferrer"
            >View on bscscan</a
          >
          <div>
            <button on:click={() => addToMetamask(token)}>metamask</button>
          </div>
        </div>
      </div>
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    padding: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .token-card {
    /* --size: 50px; */
    /* width: var(--size); */
    /* height: var(--size); */
    padding: 8px;
    border-radius: 5px;
    background-color: var(--bg-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    a {
      text-decoration: none;
      color: inherit;
    }
    img {
      width: 30px;
    }
    .footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      font-size: 0.9em;
      padding: 5px;
    }
  }
</style>
