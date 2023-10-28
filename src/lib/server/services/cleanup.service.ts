import type { JobService } from "./job.service";

export class Cleanup {
  constructor(private jobSrv: JobService) {}

  async run() {
    try {
      await this.jobSrv.cleanup();
    } catch (e) {
      // ignore
      // TODO logo
    }

    // TODO cleanup bookmark stash
  }
}
