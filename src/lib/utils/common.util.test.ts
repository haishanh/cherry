import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { breakupList } from './common.util';

test('breakupList', () => {
  assert.equal(breakupList([0, 1, 2], 1), [[0], [1], [2]]);
  assert.equal(breakupList([0, 1, 2], 2), [[0, 1], [2]]);
  assert.equal(breakupList([0, 1, 2], 3), [[0, 1, 2]]);
  assert.equal(breakupList([0, 1, 2], 4), [[0, 1, 2]]);
});

test.run();
