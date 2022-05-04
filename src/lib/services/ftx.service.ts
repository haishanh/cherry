type RequestResult<T = any> = {
  status: number;
  data: FtxResponseJson<T>;
};

type FtxResponseJson<T = any> = {
  success: boolean;
  result: T;
};

export class Ftx {
  constructor(private opts: { base: string }) {}

  async req(input: { uri: string; data?: any; method?: string }) {
    const url = this.opts.base + input.uri;
    const init: RequestInit = {
      method: input.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    if (input.data) {
      init.body = JSON.stringify(input.data);
    }
    const res = await fetch(url, init);
    const data: FtxResponseJson = await res.json();
    return { status: res.status, data };
  }

  async getSingleMarket(input: { name: string }): Promise<RequestResult<Market>> {
    return await this.req({ uri: `/markets/${input.name}` });
  }

  async candles(opts: { name: string; startMs: number; resolution?: number }): Promise<RequestResult<Candle[]>> {
    const start = Math.floor(opts.startMs / 1000);
    // const end = new Date();

    const qs = new URLSearchParams({
      start_time: String(start),
      // end_time: String(Math.ceil(end.getTime() / 1000)),
      // in second: 15, 60, 300, 900, 3600, 14400, 86400
      resolution: String(opts.resolution || 60),
    });
    return await this.req({ uri: `/markets/${opts.name}/candles?${qs}` });
  }
}

export type Market = {
  price: number;
  change1h: number;
  change24h: number;
};

export type Candle = {
  // startTime: '2021-11-26T12:02:00+00:00';
  startTime?: string;
  // unix timestamp in ms
  // time: 1637928120000;
  time: number;
  // in USD
  // open: 0.63785;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
