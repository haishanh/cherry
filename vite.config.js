import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import * as pkg from './package.json';

export default defineConfig(async () => {
  const hash = process.env.COMMIT_SHA || 'n/a';
  /** @type {import('vite').UserConfig} */
  return {
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      __COMMIT_SHA__: JSON.stringify(hash),
    },
    plugins: [sveltekit()],
  };
});
