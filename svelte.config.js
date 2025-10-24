import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // https://kit.svelte.dev/docs/integrations#preprocessors
  preprocess: vitePreprocess({ script: true }),
  kit: {
    adapter: adapter(),
    experimental: {
      remoteFunctions: true,
    },
  },
  compilerOptions: {
    runes: true,
    experimental: {
      async: true,
    },
  },
};

export default config;
