import { Parser as HtmlParser } from 'htmlparser2';

import { IMPORT_MAX_COLUMNS, IMPORT_MAX_ROWS, IMPORT_MAX_TAGS, type ImportSource } from '#lib/import.js';
import { Parser as CsvParser, ParserError } from '#lib/utils/SimpleCsvParser.util.js';

import { ApiError } from '../api.error';

export type ImportRow = {
  row: number;
  url: string;
  title?: string;
  desc?: string;
  folder?: string;
  tags: string[];
  created?: string;
  error?: string;
};

export function invalidImport(message: string): never {
  throw new ApiError(400, undefined, message);
}

function checkRowLimit(count: number) {
  if (count > IMPORT_MAX_ROWS)
    invalidImport(`Too many bookmarks. Split the file into at most ${IMPORT_MAX_ROWS} per import.`);
}

function parseCsv(text: string): ImportRow[] {
  let header: string[] | undefined;
  const rows: ImportRow[] = [];
  try {
    new CsvParser(
      text.replace(/^\uFEFF/, ''),
      (cells) => {
        if (!header) {
          header = cells.map((cell) => cell.trim().toLowerCase());
          if (!header.includes('url')) invalidImport('Invalid CSV file: missing column url.');
          if (new Set(header).size !== header.length) invalidImport('Invalid CSV file: duplicate column names.');
          return;
        }
        checkRowLimit(rows.length + 1);
        const value = (name: string) => cells[header!.indexOf(name)];
        rows.push({
          row: rows.length + 2,
          url: value('url') ?? '',
          title: value('title'),
          desc: value('description'),
          folder: value('folder') ?? value('group'),
          tags: (value('tags') ?? '').split(',', IMPORT_MAX_TAGS + 1),
          created: value('created'),
          ...(cells.length !== header.length
            ? { error: `Expected ${header.length} columns, found ${cells.length}.` }
            : {}),
        });
      },
      IMPORT_MAX_COLUMNS,
    ).parse();
  } catch (error) {
    if (error instanceof ParserError) invalidImport(`Invalid CSV file: ${error.message}.`);
    throw error;
  }
  if (!header || rows.length === 0) invalidImport('The CSV file contains no bookmarks.');
  return rows;
}

function parseHtml(text: string, source: Exclude<ImportSource, 'csv'>): ImportRow[] {
  if (source === 'netscape-bookmark-file-1' && !/^\s*<!doctype netscape-bookmark-file-1\s*>/i.test(text)) {
    invalidImport('Invalid browser export. Upload a Netscape bookmark HTML file exported by your browser.');
  }
  const rows: ImportRow[] = [];
  const folders: string[] = [];
  let pendingFolder = '';
  let heading: string | undefined;
  let liDepth = 0;
  let anchor: { attrs: Record<string, string>; title: string } | undefined;
  const parser = new HtmlParser({
    onopentag(name, attrs) {
      if (name === 'li') liDepth++;
      if (source === 'netscape-bookmark-file-1') {
        if (name === 'h3') heading = '';
        if (name === 'dl') {
          if (folders.length >= 128) invalidImport('Too many nested bookmark folders (maximum 128).');
          folders.push(pendingFolder);
          pendingFolder = '';
        }
      }
      if (name === 'a' && (source !== 'pocket' || liDepth > 0)) {
        checkRowLimit(rows.length + 1);
        anchor = { attrs, title: '' };
      }
    },
    ontext(value) {
      if (heading !== undefined) heading += value;
      if (anchor) anchor.title += value;
    },
    onclosetag(name) {
      if (name === 'li') liDepth = Math.max(0, liDepth - 1);
      if (name === 'h3' && heading !== undefined) {
        pendingFolder = heading.trim();
        heading = undefined;
      }
      if (name === 'dl') folders.pop();
      if (name !== 'a' || !anchor) return;
      const { attrs, title } = anchor;
      rows.push({
        row: rows.length + 1,
        url: attrs.href ?? '',
        title,
        folder: source === 'pocket' ? undefined : folders.filter(Boolean).join(' / '),
        tags: (attrs.tags ?? '').split(',', IMPORT_MAX_TAGS + 1),
        created: source === 'pocket' ? attrs.time_added : attrs.add_date,
      });
      anchor = undefined;
    },
  });
  parser.end(text);
  if (rows.length === 0) invalidImport('No bookmarks found. Check that this is the correct HTML export file.');
  return rows;
}

export function parseImport(text: string, source: ImportSource): ImportRow[] {
  return source === 'csv' ? parseCsv(text) : parseHtml(text, source);
}
