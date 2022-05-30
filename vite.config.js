import { sveltekit } from '@sveltejs/kit/vite';

import * as pkg from './package.json';

/** @type {import('vite').UserConfig} */
const config = {
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [sveltekit()],
};

export default config;
