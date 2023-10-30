import * as bookmarkStashDb from '$lib/server/db/bookmarkStash.db';
import * as jobDb from '$lib/server/db/job.db';

import { lite } from '../db/common.db';
import { bookmark } from './bookmark.service';
import { BookmarkStashService } from './bookmarkStash.service';
import { CleanupService } from './cleanup.service';
import { ExportService } from './export.service';
import { group } from './group.service';
import { JobService } from './job.service';
import { tag } from './tag.service';

export const registry = {
  getExportService,
  getJobService,
  getBookmarkStashService,
};

export type Registry = typeof registry;

let exportSrv: ExportService;
export function getExportService() {
  if (!exportSrv) exportSrv = new ExportService(group, tag, bookmark);
  return exportSrv;
}

let jobSrv: JobService;
export function getJobService() {
  if (!jobSrv) jobSrv = new JobService(lite(), jobDb, getExportService());
  return jobSrv;
}

let bookmarkStashService: BookmarkStashService;
export function getBookmarkStashService() {
  if (!bookmarkStashService) bookmarkStashService = new BookmarkStashService(lite(), bookmarkStashDb);
  return bookmarkStashService;
}

let cleanupSrv: CleanupService;
export function getCleanupService() {
  if (!cleanupSrv) cleanupSrv = new CleanupService(getJobService(), getBookmarkStashService());
  return cleanupSrv;
}

/// cleanup side effect

const SIX_HOURS_IN_MS = 6 * 3600 * 1000;
let cleanupTimeoutId: ReturnType<typeof setTimeout>;
function scheduleClean() {
  if (cleanupTimeoutId) clearTimeout(cleanupTimeoutId);
  cleanupTimeoutId = setTimeout(async () => {
    await getCleanupService().run();
    scheduleClean();
  }, SIX_HOURS_IN_MS);
}

scheduleClean();

/// teardown

function teardown(_signal: NodeJS.Signals) {
  if (cleanupTimeoutId) clearTimeout(cleanupTimeoutId);
}

// process.on('SIGTERM', listener)
process.on('SIGINT', teardown);
process.on('SIGTERM', teardown);
