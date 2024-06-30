let id = 1;
export function makeId() {
  return id++;
}

// modal z-index
let modalZi = 1;
export function incModalZi() {
  return modalZi++;
}

export function decModalZi() {
  if (modalZi < 2) {
    modalZi = 1;
    return modalZi;
  }
  return modalZi--;
}

export function ss(o: any) {
  try {
    return JSON.stringify(o);
  } catch (e) {
    return '"[Circular]"';
  }
}

function lowerCase(a: unknown) {
  return typeof a === 'string' ? a.toLowerCase() : '';
}

export function sortAlphabetically<T extends Record<string, unknown>>(prop: keyof T) {
  return (a: T, b: T) => {
    const f0 = lowerCase(a[prop]);
    const f1 = lowerCase(b[prop]);
    if (f0 < f1) {
      return -1;
    } else if (f0 > f1) {
      return 1;
    }
    return 0;
  };
}

export function breakupList<T>(input: T[], nbr: number) {
  let i = 0;
  let count = 0;
  const ret: T[][] = [];
  let tmp: T[] = [];
  for (; i < input.length; i++, count++) {
    if (count === nbr) {
      ret.push(tmp);
      tmp = [];
      count = 0;
    }
    tmp.push(input[i]);
  }
  if (count > 0) ret.push(tmp);
  return ret;
}

// very simple pattern
export const isEmail = (s: string) => /^\S+@[^.\s]+\.\S+$/.test(s);

export function findFirstInList<T>(list: T[], predicate: (item: T) => boolean) {
  const len = list.length;
  for (let i = 0; i < len; i++) {
    if (predicate(list[i])) return list[i];
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
