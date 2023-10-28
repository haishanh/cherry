import * as jobDb from '$lib/server/db/job.db';

import { lite } from '../db/common.db';
import { bookmark } from './bookmark.service';
import { ExportService } from './export.service';
import { group } from './group.service';
import { JobService } from './job.service';
import { tag } from './tag.service';

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
