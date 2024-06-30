import { error } from '@sveltejs/kit';

import { getUserService } from '$lib/server/services/registry';

import type { LayoutServerLoad } from './$types';

const refuse = () => error(403, 'You are not allowed!');

export const load: LayoutServerLoad = async (input) => {
  const user = input.locals?.user;
  const id = user?.id || user?.userId;
  if (!id) return refuse();
  const userSrv = getUserService();
  const maybeAdminUser = userSrv.getUserByIdWithHydratedFeature({ id });
  if (maybeAdminUser.attr.admin !== true) refuse();
};
