// Shared by the upload UI and server. Reverse-proxy/body limits may be lower.
export const IMPORT_MAX_BYTES = 10 * 1024 * 1024;
export const IMPORT_MAX_ROWS = 10_000;
export const IMPORT_MAX_ISSUES = 20;
export const IMPORT_MAX_COLUMNS = 100;
export const IMPORT_MAX_TAGS = 100;

export type ImportSource = 'csv' | 'netscape-bookmark-file-1' | 'pocket';
export type ImportDuplicates = 'skip' | 'merge-tags';
export type ImportIssue = { row: number; message: string };
export type ImportResult = {
  preview: boolean;
  total: number;
  imported: number;
  merged: number;
  skipped: number;
  failed: number;
  duplicates: number;
  issues: ImportIssue[];
  // Compatibility with older clients: bookmarks created or merged (not skipped).
  count: number;
};
