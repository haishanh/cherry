import {
  BACKUP_S3_ACCESS_KEY_ID,
  BACKUP_S3_BUCKET,
  BACKUP_S3_ENDPOINT,
  BACKUP_S3_REGION,
  BACKUP_S3_SECRET_ACCESS_KEY,
} from '$lib/env';
import * as bookmarkStashDb from '$lib/server/db/bookmarkStash.db';
import * as jobDb from '$lib/server/db/job.db';

import { lite } from '../db/common.db';
import { AdminService } from './admin.service';
import { bookmark } from './bookmark.service';
import { BookmarkStashService } from './bookmarkStash.service';
import { CleanupService } from './cleanup.service';
import { ExportService } from './export.service';
import { group } from './group.service';
import { JobService } from './job.service';
import { S3Service } from './s3.service';
import { tag } from './tag.service';
import { UserService } from './user.service';

export const registry = {
  getExportService,
  getJobService,
  getBookmarkStashService,
  getUserService,
};

export type Registry = typeof registry;

let userSrv: UserService;
export function getUserService() {
  if (!userSrv) userSrv = new UserService(lite());
  return userSrv;
}

let s3Srv: S3Service;
export function getS3Service() {
  if (!s3Srv)
    s3Srv = new S3Service({
      s3Endpoint: BACKUP_S3_ENDPOINT,
      s3Region: BACKUP_S3_REGION,
      s3Bucket: BACKUP_S3_BUCKET,
      s3AccessKeyId: BACKUP_S3_ACCESS_KEY_ID,
      s3SecretAccessKey: BACKUP_S3_SECRET_ACCESS_KEY,
    });
  return s3Srv;
}

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

let adminSrv: AdminService;
export function getAdminService() {
  if (!adminSrv) adminSrv = new AdminService(lite(), getS3Service());
  return adminSrv;
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
