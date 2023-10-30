import { logger } from '../logger';
import type { BookmarkStashService } from './bookmarkStash.service';
import type { JobService } from './job.service';

export class CleanupService {
  constructor(
    private jobSrv: JobService,
    private bookmarkStashSrv: BookmarkStashService,
  ) {}

  async run() {
    try {
      await this.jobSrv.cleanup();
    } catch (e) {
      logger.error('Failed to cleanup jobs error %s', e);
    }
    try {
      this.bookmarkStashSrv.cleanup();
    } catch (e) {
      logger.error('Failed to cleanup bookmark stashed error %s', e);
    }
  }
}
