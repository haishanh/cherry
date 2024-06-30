import { test, expect } from 'vitest';

import { breakupList } from './common.util';

test('breakupList', () => {
  expect(breakupList([0, 1, 2], 1)).toEqual([[0], [1], [2]]);
  expect(breakupList([0, 1, 2], 2)).toEqual([[0, 1], [2]]);
  expect(breakupList([0, 1, 2], 3)).toEqual([[0, 1, 2]]);
  expect(breakupList([0, 1, 2], 4)).toEqual([[0, 1, 2]]);
});
