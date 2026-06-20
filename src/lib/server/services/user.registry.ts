import { lite } from '../db/common.db';
import { UserService } from './user.service';

let userSrv: UserService;

export function getUserService() {
  if (!userSrv) userSrv = new UserService(lite());
  return userSrv;
}
