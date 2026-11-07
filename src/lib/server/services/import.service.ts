import type { Database } from 'better-sqlite3';

import {
  IMPORT_MAX_ISSUES,
  IMPORT_MAX_TAGS,
  type ImportDuplicates,
  type ImportResult,
  type ImportSource,
} from '#lib/import.js';

import { ApiError } from '../api.error';
import { logger } from '../logger';
import { parseImport } from './import-parser';

export class ImportService {
  constructor(private db: Database) {}

  run(input: { text: string; source: ImportSource; userId: number; preview: boolean; duplicates: ImportDuplicates }) {
    // Parse the entire bounded input before opening a write transaction.
    const rows = parseImport(input.text, input.source);
    const { db } = this;
    const { userId, preview, duplicates } = input;
    const result: ImportResult = {
      preview,
      total: rows.length,
      imported: 0,
      merged: 0,
      skipped: 0,
      failed: 0,
      duplicates: 0,
      issues: [],
      count: 0,
    };

    try {
      return db.transaction(() => {
        const findBookmark = db.prepare('select id from bookmark where userId = ? and url = ?');
        const insertBookmark = db.prepare(`
          insert into bookmark (userId, url, title, desc, groupId, createdAt, updatedAt)
          values (@userId, @url, @title, @desc, @groupId, @createdAt, @now) returning id
        `);
        const insertGroup = db.prepare(`
          insert into cherry_group (userId, name, createdAt, updatedAt) values (?, ?, ?, ?)
          on conflict (userId, name) do nothing
        `);
        const findGroup = db.prepare('select id from cherry_group where userId = ? and name = ?');
        const insertTag = db.prepare(`
          insert into tag (userId, name, createdAt, updatedAt) values (?, ?, ?, ?)
          on conflict (userId, name) do nothing
        `);
        const findTag = db.prepare('select id from tag where userId = ? and name = ?');
        const insertBinding = db.prepare(`
          insert into bookmark_tag (bookmarkId, tagId) values (?, ?)
          on conflict (bookmarkId, tagId) do nothing
        `);
        const seen = new Set<string>();
        const now = Math.floor(Date.now() / 1000);

        for (const row of rows) {
          const url = row.url.trim();
          let error = row.error;
          if (row.tags.length > IMPORT_MAX_TAGS)
            error ??= `Too many tag entries (maximum ${IMPORT_MAX_TAGS} per bookmark).`;
          try {
            const parsed = new URL(url);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Unsupported protocol');
          } catch {
            error ??= 'Invalid URL. Use an absolute http:// or https:// URL.';
          }
          let createdAt = now;
          const created = row.created?.trim();
          if (created) {
            createdAt = /^\d+$/.test(created) ? Number(created) : Math.floor(Date.parse(created) / 1000);
            if (!Number.isSafeInteger(createdAt) || createdAt < 0 || createdAt > 8_640_000_000_000) {
              error ??= 'Invalid created date. Use Unix seconds or an ISO date.';
            }
          }
          if (error) {
            result.failed++;
            if (result.issues.length < IMPORT_MAX_ISSUES) result.issues.push({ row: row.row, message: error });
            continue;
          }
          if (seen.has(url)) {
            result.duplicates++;
            result.skipped++;
            continue;
          }
          seen.add(url);
          const existing = findBookmark.get(userId, url) as { id: number } | undefined;
          if (existing) {
            result.duplicates++;
            if (duplicates === 'skip') {
              result.skipped++;
              continue;
            }
            result.merged++;
          } else {
            result.imported++;
          }
          if (preview) continue;

          let bookmarkId = existing?.id;
          if (bookmarkId === undefined) {
            let groupId: number | null = null;
            const folder = row.folder?.trim();
            if (folder) {
              insertGroup.run(userId, folder, now, now);
              groupId = (findGroup.get(userId, folder) as { id: number }).id;
            }
            bookmarkId = (
              insertBookmark.get({
                userId,
                url,
                title: row.title ?? url,
                desc: row.desc ?? '',
                groupId,
                createdAt,
                now,
              }) as { id: number }
            ).id;
          }
          // Merging duplicates is additive: never overwrite existing metadata or remove tags.
          const tags = new Set(row.tags.map((tag) => tag.trim()).filter(Boolean));
          for (const name of tags) {
            insertTag.run(userId, name, now, now);
            const tagId = (findTag.get(userId, name) as { id: number }).id;
            insertBinding.run(bookmarkId, tagId);
          }
        }
        result.count = result.imported + result.merged;
        return result;
      })();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error({ error }, 'import rolled back');
      throw new ApiError(
        500,
        undefined,
        'Import failed. No changes were saved. Please retry or contact your administrator.',
      );
    }
  }
}
