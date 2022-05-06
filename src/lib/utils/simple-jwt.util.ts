// TODO remove this file?

const b64dec = (str: string) => Buffer.from(str, 'base64').toString();

export function decode(jwt: string) {
  const [_, claimRaw] = jwt.split('.');
  const claimStr = b64dec(claimRaw);
  return JSON.parse(claimStr);
}
