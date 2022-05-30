import crypto from 'node:crypto';

// headers
// {
//   "alg": "HS256",
//   "typ": "JWT"
// }
//
// claims
// {
//   "userId": 3,
//   "feature": 1,
//   "username": "ch001@haishan.me",
//   "iat": 1664020169
// }

export function generate(payload: any, secret: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(generate0(payload, secret));
      } catch (e) {
        reject(e);
      }
    }, 0);
  });
}

export function validate(token: string, secret: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(validate0(token, secret));
      } catch (e) {
        reject(e);
      }
    }, 0);
  });
}

// HS256 only
function generate0(payload: any, secret: string) {
  if (!payload.iat) payload.iat = Math.trunc(Date.now() / 1000);
  const headers = b64urlEnc(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const claims = b64urlEnc(JSON.stringify(payload));
  const signaure = sign(headers + '.' + claims, secret);
  return headers + '.' + claims + '.' + signaure;
}

function validate0(token: string, secret: string) {
  if (!token) throw new Error('Invalid token');
  const [s0, s1, theirSig] = token.split('.');
  if (!s0 || !s1 || !theirSig) throw new Error('Invalid token');
  const headers = JSON.parse(b64urlDec(s0));
  if (headers.alg !== 'HS256') throw new Error('Algorithm not supported');
  const claims = JSON.parse(b64urlDec(s1));
  if (claims.nbf && Date.now() < claims.nbf * 1000) throw new Error('Token not yet active');
  if (claims.exp && Date.now() > claims.exp * 1000) throw new Error('Token expired');
  const ourSig = sign(s0 + '.' + s1, secret);
  if (theirSig !== ourSig) throw new Error('Signature verification failed');
  return claims;
}

function sign(input: string, key: string) {
  return crypto.createHmac('sha256', key).update(input).digest('base64url');
}

function b64urlEnc(s: string) {
  return Buffer.from(s).toString('base64url');
}

function b64urlDec(s: string) {
  return Buffer.from(s, 'base64url').toString('utf8');
}
