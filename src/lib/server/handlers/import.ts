import type { RequestHandler } from '@sveltejs/kit';

import { IMPORT_MAX_BYTES } from '#lib/import.js';

import { ApiError } from '../api.error';
import { lite } from '../db/common.db';
import { ImportService } from '../services/import.service';
import { ensureUser } from './helper';
import { wrap } from './wrap';

function tooLarge(): never {
  throw new ApiError(413, undefined, 'Import file is too large. The maximum is 10 MiB.');
}

export async function readImportBody(request: Request, maxBytes = IMPORT_MAX_BYTES): Promise<string> {
  const length = request.headers.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > maxBytes) {
    // Cancelling SvelteKit's Node request stream destroys its HTTP socket before
    // the JSON error can be sent. The adapter drains unread bytes after responding.
    tooLarge();
  }
  if (!request.body) throw new ApiError(400, undefined, 'Select a non-empty export file.');
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  const parts: string[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) tooLarge();
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
  } catch (error) {
    // Release the reader below, but leave the socket open for the error response.
    if (error instanceof ApiError) throw error;
    if (error && typeof error === 'object' && 'status' in error && error.status === 413) {
      throw new ApiError(413, undefined, 'The server upload limit was exceeded. Split the export into smaller files.');
    }
    throw new ApiError(400, undefined, 'Could not read the export file. Upload a UTF-8 encoded file and try again.');
  } finally {
    reader.releaseLock();
  }
  if (size === 0) throw new ApiError(400, undefined, 'Select a non-empty export file.');
  return parts.join('');
}

export function importHandler(source: (event: Parameters<RequestHandler>[0]) => string | undefined): RequestHandler {
  return (event) =>
    wrap(event, async (event) => {
      const user = ensureUser(event);
      const format = source(event);
      if (format !== 'csv' && format !== 'pocket' && format !== 'netscape-bookmark-file-1') {
        throw new ApiError(400, undefined, 'Unexpected bookmark source.');
      }
      const preview = event.url.searchParams.get('preview') ?? '0';
      const duplicates = event.url.searchParams.get('duplicates') ?? 'skip';
      if (preview !== '0' && preview !== '1') throw new ApiError(400, undefined, 'preview must be 0 or 1.');
      if (duplicates !== 'skip' && duplicates !== 'merge-tags') {
        throw new ApiError(400, undefined, 'duplicates must be skip or merge-tags.');
      }
      const text = await readImportBody(event.request);
      const result = new ImportService(lite()).run({
        text,
        source: format,
        userId: user.userId,
        preview: preview === '1',
        duplicates,
      });
      return Response.json(result);
    });
}
