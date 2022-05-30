#!/usr/bin/env node

// bundle this
// pnpm esbuild src/cli/index.ts --bundle --minify --platform=node --target=node18 --outfile=cli

import sade from 'sade';

import * as admin from './admin';

const prog = sade('cherry');

type SadeOptionItem = {
  flag: string;
  description?: string;
  value?: sade.Value;
};

type Cmd = { command: string; describe: string; examples?: string[]; options?: SadeOptionItem[]; action: sade.Handler };

const commands = [
  {
    command: 'update-user-password <username> <newPassword>',
    describe: 'Update password of an existing user',
    action: admin.update_user_password,
  },
  {
    command: 'create-user <username> <password>',
    describe: 'Create user',
    // examples: ['build -w', 'build -l err -w'],
    // options: [{ flag: '--username', description: 'Username', value: 'debug' }],
    action: admin.create_user,
  },
  {
    command: 'delete-user <id> <username>',
    describe: 'Delete a user and their resources',
    action: admin.delete_user,
  },
  {
    command: 'migration <to>',
    examples: ['migration /data/v2.sqlite'],
    describe: "Migrate to a new database file (don't try if you don't know what this is)",
    action: admin.migration,
  },
];

function enableCommand(cmd: Cmd, prog: sade.Sade) {
  const p = prog.command(cmd.command).describe(cmd.describe);
  if (cmd.examples) cmd.examples.forEach((e) => p.example(e));
  if (cmd.options) cmd.options.forEach((o) => p.option(o.flag, o.description, o.value));
  p.action(cmd.action);
  return p;
}

function enableCommands(cmds: Cmd[], prog: sade.Sade) {
  const p = prog;
  cmds.forEach((cmd) => enableCommand(cmd, p));
  return p;
}

enableCommands(commands, prog).parse(process.argv);
