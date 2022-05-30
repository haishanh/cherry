import dbg from 'debug';

import { LOG_LEVEL } from '$lib/env';

const debug = dbg('cherry:debug');
const info = dbg('cherry:info');
const warn = dbg('cherry:warn');
const error = dbg('cherry:error');

(() => {
  const str = [];
  switch (LOG_LEVEL) {
    case 'debug':
      str.push('cherry:debug');
    // falls through
    case 'info':
      str.push('cherry:info');
    // falls through
    case 'warn':
      str.push('cherry:warn');
    // falls through
    case 'error':
      str.push('cherry:error');
  }
  dbg.enable(str.join(','));
})();

export const logger = { debug, info, warn, error };
