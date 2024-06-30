import * as fs from 'node:fs';
import { access, constants } from 'node:fs/promises';
import * as path from 'node:path';
import { Readable } from 'node:stream';

import type { RequestHandler } from '@sveltejs/kit';

import { DATA_DIR } from '$lib/env';
import { ApiError, HttpStatus } from '$lib/server/api.error';
import { ensureUser, forbidden, notFound } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const file = event.params.file;
    if (!file) {
      throw new ApiError(HttpStatus.BAD_REQUEST);
    }

    // [0] - type of the file
    // [1] - user id, owner of the file
    const parts = file.split('-');
    const userIdStr = parts[1];

    if ('' + user.userId !== '' + userIdStr) {
      return notFound();
    }

    const filepath = path.join(DATA_DIR, file);
    try {
      await access(filepath, constants.R_OK);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return notFound();
      } else if ((e as NodeJS.ErrnoException).code === 'EACCES') {
        return forbidden();
      }
      throw e;
    }

    const rs = fs.createReadStream(filepath);
    const readable = Readable.toWeb(rs);
    // @ts-ignore
    return new Response(readable, {
      status: HttpStatus.OK,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${file}"`,
      },
    });
  });
};
