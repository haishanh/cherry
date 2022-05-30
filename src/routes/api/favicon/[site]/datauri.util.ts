export function parse(input: string) {
  if (input.substring(0, 5) !== 'data:') throw TypeError('not a data URI');
  const len = input.length;
  let i = 5;
  let isB64 = false;
  let type: string | undefined;
  for (; i < len; i++) {
    const char = input[i];
    if (char === ',') break;
    if (char === ';') {
      // look after
      if (input.substring(i + 1, i + 7) === 'base64') {
        type = input.substring(5, i);
        isB64 = true;
        i = i + 6;
        continue;
      }
    }
  }
  // type could also be empty string set in the for-loop
  if (type === undefined) type = input.substring(5, i);
  const data = input.substring(i + 1, len);
  return { type, isB64, data };
}
