import jwt from 'jsonwebtoken';

export function sign(payload: string | Buffer | object, secret: string) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, (e, d) => {
      if (e) return reject(e);
      return resolve(d);
    });
  });
}

export function verify(token: string, secret: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (e, d) => {
      if (e) return reject(e);
      return resolve(d);
    });
  });
}
