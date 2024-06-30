import { describe, it, expect } from 'vitest';
import { parseMeta } from './html.util';

describe('parseMeta', () => {
  it('basic', () => {
    const ret = parseMeta('<html><head><title>hello</title></head></html>');
    expect(ret).toEqual({ title: 'hello', desc: '' });
  });
});
