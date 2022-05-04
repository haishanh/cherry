import { CoinGecko } from '$lib/services/coingecko.service';
import type { CoinGeckoMarket } from '$lib/services/coingecko.service';
import type { RequestHandler } from '@sveltejs/kit';

// import { logger } from '$lib/logger';

function formatMarkets(items: CoinGeckoMarket[]) {
  return items.map((item) => {
    const p1hN = item.price_change_percentage_1h_in_currency;
    const p1h = typeof p1hN === 'number' ? p1hN.toFixed(2) : 'n/a';
    const p24hN = item.price_change_percentage_24h_in_currency;
    const p24h = typeof p24hN === 'number' ? p24hN.toFixed(2) : 'n/a';
    const p7dN = item.price_change_percentage_7d_in_currency;
    const p7d = typeof p7dN === 'number' ? p7dN.toFixed(2) : 'n/a';
    return {
      id: item.id,
      symbol: item.symbol,
      p: item.current_price,
      p1h,
      p24h,
      p7d,
    };
  });
}

function makeMarkets() {
  const ret = [];
  for (let i = 0; i < 8; i++) {
    ret.push({
      symbol: 'xx',
      p: 23.03234442,
      p1h: -3.0,
      p24h: 3.01,
      p7d: 3.22,
    });
  }
  return ret;
}

export const get: RequestHandler = async ({ params }) => {
  const gecko = new CoinGecko();
  const ret = await gecko.markets();
  const body = formatMarkets(ret.data);
  // const body = makeMarkets();
  return { body };
};
