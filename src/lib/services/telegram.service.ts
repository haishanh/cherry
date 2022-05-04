type SendMessageParams = {
  chat_id: number;
  text: string;
  parse_mode?: string;
  // reply_markup?: ReplyKeyboardMarkup;
};

type SendPhotoParams = {
  chat_id: number;
  photo: string;
  caption: string;
  parse_mode?: string;
};

export class Telegram {
  constructor(private opts: { base: string; jwt: string }) {}

  req(input: { uri: string; data?: any; method?: string }) {
    const url = this.opts.base + input.uri;
    const init: RequestInit = {
      method: input.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.opts.jwt}`,
      },
    };
    if (input.data) {
      init.body = JSON.stringify(input.data);
    }
    return fetch(url, init);
  }

  async sendMessage(body: SendMessageParams) {
    return await this.req({
      uri: '/sendMessage',
      method: 'POST',
      data: { parse_mode: 'MarkdownV2', ...body },
    });
  }

  async sendPhoto(body: SendPhotoParams) {
    return await this.req({
      uri: '/sendPhoto',
      method: 'POST',
      data: { parse_mode: 'MarkdownV2', ...body },
    });
  }
}
