import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import * as pkg from './package.json';

export default defineConfig(async () => {
  const hash = process.env.COMMIT_SHA || '';
  /** @type {import('vite').UserConfig} */
  return {
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      __COMMIT_SHA__: JSON.stringify(hash),
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // or "modern"
        },
      },
    },
    plugins: [
      sveltekit({
        preprocess: vitePreprocess(),
        adapter: adapter(),
        experimental: {
          remoteFunctions: true,
        },
        compilerOptions: {
          runes: true,
          experimental: {
            async: true,
          },
        },
      }),
    ],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  };
});
