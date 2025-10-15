import { verify } from '@node-rs/argon2';
import { test, expect } from 'vitest';

test('ensure different versions/impls of argo2 are compatible', async () => {
  const hps = [
    '+8O#e&-/@srG*3kx/~0j $argon2id$v=19$m=19456,t=2,p=1$3yfp1EXQCCCqxOGC88MYcg$Hsmv+kaYsYU0renQan0YyNdwzrepR7cmhK8JMM0BIN8',
    '%tY;7@3ehGBwtc;O!r$( $argon2id$v=19$m=19456,t=2,p=1$kMDTttKfa7WvaRjo8njQIA$G30U7ZeFRXLreCFZJ3IGSVgEjQXv/AevPqt7TcczYfA',
    '85aK=U2FK9kJcu%`py64 $argon2id$v=19$m=19456,t=2,p=1$P3YApTZqJk0RRM9MMsKNtQ$nGd6ABJwlcZQNANJxBuBK/LcGHN97RoLrJfqZSGKu+A',
    'a4fc44d9-649b-473b-8efd-724d9ec7f2ae $argon2id$v=19$m=19456,t=2,p=1$70XVXDDx4NDuLB2yRbCO8A$D1ItFcZVUIBGFxVwQD5Z/9rE6egIzITkifAVgY48Hqw',
    '44d9649b-d73b-4efd-b24d-9ec7f2ae55d8 $argon2id$v=19$m=19456,t=2,p=1$dwsyIFCAdYAqcl4mwbPrtg$KEYfOi+pr7B2n7AC5+vVb4N0pqVMTWcJ/NSE8enUINI',
    'd9649bd7-3b8e-4d72-8d9e-c7f2ae55d891 $argon2id$v=19$m=19456,t=2,p=1$QPNEOIbAYVkdYfViwmh/iw$pe/8daaJxf7I+Avhu6u0cVkcQ8RZRL+V2TpSjvMN7N4',
  ];
  for (const hp of hps) {
    const [p, h] = hp.split(' ');
    expect(await verify(h, p)).toBe(true);
  }
});
