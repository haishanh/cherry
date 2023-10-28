import type { Database } from 'better-sqlite3';

// import { DataError, DataErrorCode, lite } from '$lib/server/db/common.db';
import type * as jobDb from '$lib/server/db/job.db';
import {
  JobOperation,
  type InputAllJob,
  type InputCreateJob,
  type InputUpdateJobError,
  type InputUpdateJobOutput,
  type JobExportOutput,
} from '$lib/type';
import type { ExportService } from './export.service';

export class JobService {
  constructor(
    private db: Database,
    private job: typeof jobDb,
    private exportSrv: ExportService,
  ) {}

  create(input: InputCreateJob) {
    return this.job.createJob(this.db, input);
  }

  get(input: { id: number }) {
    return this.job.get(this.db, input);
  }

  all(input: InputAllJob) {
    return this.job.all(this.db, input);
  }

  updateOutput(input: InputUpdateJobOutput) {
    return this.job.updateOutput(this.db, input);
  }

  updateError(input: InputUpdateJobError) {
    return this.job.updateError(this.db, input);
  }

  async cleanup() {
    const nowSec = Math.ceil(Date.now() / 1000);
    const expiredJobs = this.all({}).filter((job) => nowSec > job.exp);
    const expiredJobsIds = expiredJobs.map((job) => job.id);
    // delete jobs
    this.job.deleteMany(this.db, { ids: expiredJobsIds });
    // delete export CSV files
    const wipWorks = expiredJobs
      .map((job) => {
        if (job.op === JobOperation.Export && job.output) {
          const output = JSON.parse(job.output) as JobExportOutput;
          if (output.filename) return output.filename;
        }
        return '';
      })
      .filter((x) => !!x)
      .map((filename) => {
        return this.exportSrv.removeExportFile(filename);
      });
    await Promise.all(wipWorks);
  }
}
