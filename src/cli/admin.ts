import { createCliAdminCommands } from '$lib/server/admin/cli';

async function report(res: Response) {
  if (res.ok) {
    console.log('SUCCESS');
    try {
      console.log(await res.json());
    } catch (e) {
      // ignore
    }
  } else {
    console.log('ERROR');
    console.log('status', res.status);
    for (const entry of res.headers) {
      console.log(`${entry[0]}: ${entry[1]}`);
    }
    console.log(await res.json());
    process.exit(1);
  }
}

const admin = createCliAdminCommands();

export async function list_users() {
  const res = await admin.listUsers();
  await report(res);
}

export async function create_user(username: string, password: string, options: { admin: boolean }) {
  const res = await admin.createUser(username, password, options);
  await report(res);
}

export async function set_admin(username: string) {
  const res = await admin.setAdmin(username);
  await report(res);
}

export async function unset_admin(username: string) {
  const res = await admin.unsetAdmin(username);
  await report(res);
}

export async function migration(to: string) {
  const res = await admin.migration(to);
  await report(res);
}

export async function delete_user(id: string, username: string) {
  const res = await admin.deleteUser(id, username);
  await report(res);
}

export async function update_user_password(username: string, newPassword: string) {
  const res = await admin.updateUserPassword(username, newPassword);
  await report(res);
}
