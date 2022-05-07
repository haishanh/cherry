function info(...args: any[]) {
  const now = new Date();
  const t = now.toISOString();
  console.log(t, ...args);
}

export const logger = {
  info,
  error: info,
};
