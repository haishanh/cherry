import { createReadStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { Database } from 'better-sqlite3';
import { format } from 'date-fns';
import tar from 'tar';

import { BACKUP_S3_BUCKET, BACKUP_S3_PREFIX, DATA_DIR } from '$lib/env';
import * as userDb from '$lib/server/db/user.db';
import type { InputAdminDeleteUser } from '$lib/type';

import { ApiError } from '../api.error';
import { logger } from '../logger';
import type { S3Service } from './s3.service';

const noop = () => {};

export class AdminService {
  constructor(
    private db: Database,
    private s3Srv: S3Service,
  ) {}

  async deleteUser(input: InputAdminDeleteUser) {
    // username is not strictly needed
    // it's just a friction to prevent admin from deleting the user they are not intending to
    const { id, username } = input;
    const user = userDb.getUserById(this.db, { id });
    if (user?.username !== username) throw new ApiError(400);
    logger.info('deleting user id=%s username=%s', id, username);
    // proceed to delete
    userDb.deleteUserById(this.db, { id });
  }

  async deleteUserResource(input: { id: number }) {
    const userId = input.id;

    // we don't need to handle bookmark_tag
    // they will be taken care by the SQLite trigger

    const tagDb = await import('$lib/server/db/tag.db');
    tagDb.deleteTagsByUserId(this.db, { userId });
    const groupDb = await import('$lib/server/db/group.db');
    groupDb.deleteGroupsByUserId(this.db, { userId });
    const bookmarkDb = await import('$lib/server/db/bookmark.db');
    bookmarkDb.deleteBookmarksByUserId(this.db, { userId });
  }

  async backupDb() {
    const now = new Date();
    const timestamp = format(now, 'yyyyMMddHHmmss');
    const yearmonth = format(now, 'yyyyMM');
    const filename = `backup${timestamp}.sqlite3`;
    const filepath = path.join(DATA_DIR, filename);
    const tarballFilepath = filepath + '.tar.gz';
    try {
      const result = await this.db.backup(filepath);
      await tar.create({ gzip: true, file: tarballFilepath }, [filepath]);
      const prefix = BACKUP_S3_PREFIX.replace(/\/$/, '');
      const Key = `${prefix}/${yearmonth}/${path.basename(tarballFilepath)}`;
      const Body = createReadStream(tarballFilepath);
      await this.s3Srv.putObject({ Key, Body });
      return { ...result, key: Key };
    } finally {
      fs.unlink(filepath).catch(noop);
      fs.unlink(tarballFilepath).catch(noop);
    }
  }

  backupDbMeta() {
    const prefix = BACKUP_S3_PREFIX.replace(/\/$/, '');
    const timestamp = 'yyyyMMddHHmmss';
    const yearmonth = 'yyyyMM';
    return {
      s3Bucket: BACKUP_S3_BUCKET,
      s3KeyTemplate: `${prefix}/${yearmonth}/backup${timestamp}.sqlite3.tar.gz`,
    };
  }
}
