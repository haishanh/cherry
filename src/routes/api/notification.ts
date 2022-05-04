import type { RequestHandler } from '@sveltejs/kit';

import { Telegram } from '$lib/services/telegram.service';
import { Ftx } from '$lib/services/ftx.service';
import type { Candle } from '$lib/services/ftx.service';

import * as jwtUtil from '$lib/utils/simple-jwt.util';

import { TELEGRAM_JWT } from '$lib/env';

const DISABLE_COVER_IMAGE = true;
const THRESHOLD = 0.004;

export type MarketConfig = {
  market: string;
  // cgId?: string;
  // CoinGecko Link
  coingecko?: string;
  coverImageUrl?: string;
};

const coinInfo = {
  btc: { coingecko: 'https://www.coingecko.com/en/coins/bitcoin' },
  bnb: { coingecko: 'https://www.coingecko.com/en/coins/bnb' },
  gmt: { coingecko: 'https://www.coingecko.com/en/coins/stepn' },
  ape: { coingecko: 'https://www.coingecko.com/en/coins/apecoin' },
  eth: {
    coingecko: 'https://www.coingecko.com/en/coins/ethereum',
    coverImageUrl: 'https://dd-static.jd.com/ddimg/jfs/t1/209482/18/14881/53776/61d2e64aE13dca043/2a9960584433d52d.jpg',
  },
  cake: {
    coingecko: 'https://www.coingecko.com/en/coins/pancakeswap',
    coverImageUrl: 'https://dd-static.jd.com/ddimg/jfs/t1/112933/3/27498/198833/61d27b37E05e5a60d/bc2fa741af1cfe4b.jpg',
  },
  gala: {
    coingecko: 'https://www.coingecko.com/en/coins/gala',
    coverImageUrl: 'https://dd-static.jd.com/ddimg/jfs/t1/220950/6/9788/77032/61d2e65aE048b7246/20ffc1680254c6d2.jpg',
  },
  sol: {
    coingecko: 'https://www.coingecko.com/en/coins/solana',
    coverImageUrl: 'https://dd-static.jd.com/ddimg/jfs/t1/92994/22/20576/126217/61d2786eE01f744c1/ca2a14a943356647.jpg',
  },
  luna: {
    coingecko: 'https://www.coingecko.com/en/coins/terra-luna',
    coverImageUrl: 'https://dd-static.jd.com/ddimg/jfs/t1/220667/16/9821/151684/61d272f5Eb3498afb/2a55391ccdd331a2.jpg',
  },
  near: {
    coingecko: 'https://www.coingecko.com/en/coins/near',
  },
};

// @deprecated
const values = {
  cake: [11, 11.3, 11.6, 11.9, 12.2, 12.5, 12.8, 13.1],
  gala: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65],
  eth: [3600, 3650, 3700, 3750, 3800, 3850, 3900, 3950, 4000, 4100, 4200, 4300],
  sol: [170, 175, 180, 185, 190, 195, 200],
  luna: [84, 87, 90, 93, 96, 99],
  near: [12, 13, 14, 15, 16, 17, 18, 19],
};

const configs: MarketConfig[] = [
  { market: 'GALA-PERP', ...coinInfo.gala },
  { market: 'CAKE-PERP', ...coinInfo.cake },
  { market: 'BTC/USD', ...coinInfo.btc },
  { market: 'BNB/USD', ...coinInfo.bnb },
  { market: 'GMT/USD', ...coinInfo.gmt },
  { market: 'APE/USD', ...coinInfo.ape },
  { market: 'ETH/USD', ...coinInfo.eth },
  { market: 'SOL/USD', ...coinInfo.sol },
  { market: 'LUNA/USD', ...coinInfo.luna },
  { market: 'NEAR/USD', ...coinInfo.near },
];

export const get: RequestHandler = async () => {
  const fetches = configs.map((conf) => market2(conf));
  const potentialMessages = await Promise.all(fetches);
  const messages = potentialMessages.filter((x) => !!x).map((a) => a.message);
  const message = messages.join('\n');
  await send({ message });
  if (message) {
    return { status: 200, body: { message } };
  }
  return { status: 204 };
};

const charsNeedEscape = '_*[]()~`>#+-=|{}.!';

function escapeEntities(input: string) {
  const len = input.length;
  let output = '';
  for (let i = 0; i < len; i++) {
    const c = input[i];
    if (charsNeedEscape.indexOf(c) >= 0) {
      output += '\\' + c;
    } else {
      output += c;
    }
  }
  return output;
}

async function send(input: { message: string; config?: MarketConfig }) {
  const token = TELEGRAM_JWT;
  const claim = jwtUtil.decode(token);
  const tg = new Telegram({ base: 'https://tgb.vercel.app/api/tgproxy/v1', jwt: token });

  let message = input.message;

  const config = input.config;
  if (config && config.coingecko) {
    message += `\n\n${config.coingecko}`;
  }

  const escapedMsg = escapeEntities(message);

  if (!DISABLE_COVER_IMAGE && config && config.coverImageUrl) {
    return await tg.sendPhoto({ photo: config.coverImageUrl, caption: escapedMsg, chat_id: claim.chatId });
  } else {
    return await tg.sendMessage({ text: escapedMsg, chat_id: claim.chatId });
  }
}

const compareFn = {
  gt: { fn: (a: number, b: number) => a > b, display: '>' },
  lt: { fn: (a: number, b: number) => a < b, display: '<' },
};

function handleCondition(input: { candles: Candle[]; config: MarketConfig }) {
  const { candles, config } = input;
  // const cond = config.cond;
  // const compare = compareFn[op];

  const candleLen = candles.length;
  const last = candles[candleLen - 1];
  const first = candles[0];

  const diff = (last.close - first.close) / last.close;
  if (diff > THRESHOLD || diff < -THRESHOLD) {
    const message = `${config.market} price is now ${last.close} (${percentage(diff)}%)`;
    return { message, config };
  }
}

async function market2(input: MarketConfig) {
  const candles = await getSingleMarket({ name: input.market });

  // TODO to remove
  // const cond = input.cond;
  // const op = cond.op;

  return handleCondition({ candles, config: input });
}

// const marketByName: Record<string, Candle[]> = {};
async function getSingleMarket(input: { name: string }) {
  // const cached = marketByName[input.name];
  // if (cached) return cached;

  const ftx = new Ftx({ base: 'https://ftx.com/api' });

  const now = Date.now();
  console.log('now', now.toString());
  // 6 min backward
  const startMs = now - 36e4;
  const ret = await ftx.candles({ name: input.name, startMs });
  const market = ret.data.result;

  // save it
  // marketByName[input.name] = market;

  return market;
}

function toFixed(s: number | 'string', n: number) {
  return Number(s).toFixed(n);
}

function percentage(input: number) {
  return toFixed(input * 100, 2);
}
