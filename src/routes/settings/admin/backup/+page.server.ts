import { getAdminService } from '#lib/server/services/registry.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (input) => {
  const adminSrv = getAdminService();
  await input.parent();
  return {
    backupDbMeta: adminSrv.backupDbMeta(),
  };
};
