import { isEmail } from '$lib/utils/common.util';

export const commonRule = {
  email: {
    validate: isEmail,
    msg: 'Invalid email',
  },
  url: {
    validate: (s: string) => /^https?:\/\/\S+$/.test(s),
    msg: "It doens't look like a URL",
  },
};

type ValidationRuleItem = {
  validate: (s: string) => boolean;
  msg: string;
};

// it either returns { value: {} } or { error: {} }
export function validate<V>(rule: { [k in keyof V]: ValidationRuleItem[] }, value: V) {
  const keys = Object.keys(value);
  const validatedValue: V = {} as V;

  const error: { [k in keyof V]: string } = {} as { [k in keyof V]: string };
  for (const k of keys) error[k] = '';

  let valid = true;
  out: for (const k of keys) {
    const s = (value[k] || '').trim();
    const rules = rule[k];
    if (!rules) continue;
    for (const rule of rules) {
      const ret = rule.validate(s);
      if (!ret) {
        error[k] = rule.msg;
        valid = false;
        break out;
      }
    }
    validatedValue[k] = s;
  }
  if (valid) return { value: validatedValue };
  return { error };
}
