#!/usr/bin/env node

// bundle this
// pnpm esbuild src/cli/index.ts --bundle --minify --platform=node --target=node18 --outfile=cli

import sade from 'sade';

import * as admin from './admin';

sade('cherry')
  .version('0.0.1')
  .command('update-user-password <username> <newPassword>')
  .describe('Update password of an existing user')
  .action(admin.update_user_password)
  .command('create-user <username> <password>')
  .option('--admin', 'Created user will be an admin', false)
  .describe('Create user')
  .action(admin.create_user)
  .command('set-admin <username>')
  .describe('Set an user as an admin user')
  .action(admin.set_admin)
  .command('unset-admin <username>')
  .describe('Unset an user as an admin user')
  .action(admin.unset_admin)
  .command('delete-user <id> <username>')
  .describe('Delete a user and their resources')
  .action(admin.delete_user)
  .command('migration <to>')
  .describe("Migrate to a new database file (don't try if you don't know what this is)")
  .example('migration /data/v2.sqlite')
  .action(admin.migration)
  .parse(process.argv);
