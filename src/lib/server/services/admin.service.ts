import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Upload } from '@aws-sdk/lib-storage';
import type { Database } from 'better-sqlite3';
import { format } from 'date-fns';
import * as tar from 'tar/create';
import { Duplex } from 'node:stream';
import { BACKUP_S3_BUCKET, BACKUP_S3_PREFIX, DATA_DIR } from '$lib/env';
import * as bookmarkDb from '$lib/server/db/bookmark.db';
import * as groupDb from '$lib/server/db/group.db';
import * as tagDb from '$lib/server/db/tag.db';
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
    if (user?.username !== username) throw new ApiError(400, '', 'Username and Id mismatch');
    logger.info('deleting user id=%s username=%s', id, username);
    // proceed to delete
    userDb.deleteUserById(this.db, { id });
  }

  async deleteUserResource(input: { id: number }) {
    const userId = input.id;

    // we don't need to handle bookmark_tag
    // they will be taken care by the SQLite trigger

    tagDb.deleteTagsByUserId(this.db, { userId });
    groupDb.deleteGroupsByUserId(this.db, { userId });
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
      const tarReadStream = tar.create({ gzip: true }, [filepath]);
      const dup = Duplex.from(tarReadStream);
      const prefix = BACKUP_S3_PREFIX.replace(/\/$/, '');
      const Key = `${prefix}/${yearmonth}/${path.basename(tarballFilepath)}`;
      const parallelUploads3 = new Upload({
        client: this.s3Srv.s3,
        params: { Bucket: this.s3Srv.bucket, Key, Body: dup },
        tags: [],
        // additional optional fields show default values below:

        // (optional) concurrency configuration
        queueSize: 4,

        // (optional) size of each part, in bytes, at least 5MB
        partSize: 1024 * 1024 * 5,

        // (optional) when true, do not automatically call AbortMultipartUpload when
        // a multipart upload fails to complete. You should then manually handle
        // the leftover parts.
        leavePartsOnError: false,
      });

      parallelUploads3.on('httpUploadProgress', (progress) => {
        logger.info(progress, 'httpUploadProgress');
      });
      await parallelUploads3.done();

      return { ...result, key: Key };
    } finally {
      fs.unlink(filepath).catch(noop);
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
