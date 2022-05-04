import { COINGECKO_BASEURL } from '$lib/env';

const BASE_URL = COINGECKO_BASEURL;

type ApiResponse<T> = { status: number; data: T };

export class CoinGecko {
  // https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&price_change_percentage=1h,24h,7d&ids=ethereum,terra-luna
  async markets(): Promise<ApiResponse<CoinGeckoMarket[]>> {
    const coins = [
      'frax-share', // https://www.coingecko.com/en/coins/frax-share
      'near',
      'frax-price-index-share', // FPIS
      'genopets', // GENE https://www.coingecko.com/en/coins/genopets
      'looksrare', // LOOKS https://www.coingecko.com/en/coins/looksrare
      'stepn', // GMT https://www.coingecko.com/en/coins/stepn
      'apecoin', // https://www.coingecko.com/en/coins/apecoin
      'pacoca', // https://www.coingecko.com/en/coins/pacoca
      'juno-network', // JUNO
      // "bomber-coin", // BCOIN
      // "chargedefi-static",
      'genesysgo-shadow', // SHDW
      // 'uxd-protocol-token', // UXP
      'coin98', // C98
      'bitcoin',
      'osmosis',
      'ftx-token',
      'cosmos',
      'crypto-com-chain',
      'ethereum',
      'solana',
      'pancakeswap-token',
      'convex-finance',
      'curve-dao-token',
      'alpaca-finance',
      // "arweave",
      // "aldrin", // RIN
      'terra-luna', // LUNA
      'avalanche-2',
      'binancecoin', // BNB
    ];
    const qs = new URLSearchParams({
      vs_currency: 'usd',
      price_change_percentage: '1h,24h,7d',
      ids: coins.join(','),
    });
    const uri = `/coins/markets?${qs}`;
    return this.req({ uri });
  }

  async req(input: { uri: string; data?: any; method?: string }) {
    const url = BASE_URL + input.uri;
    const init: RequestInit = {
      method: input.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    if (input.data) init.body = JSON.stringify(input.data);
    // const controller = new AbortController();
    // const timeout = setTimeout(() => controller.abort(), 15000);
    // init.signal = controller.signal;
    const res = await fetch(url, init);
    try {
      const data = await res.json();
      return { status: res.status, data };
    } finally {
      // clearTimeout(timeout);
    }
  }
}

export type CoinGeckoMarket = {
  id: string;
  current_price: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  symbol: string;
};
