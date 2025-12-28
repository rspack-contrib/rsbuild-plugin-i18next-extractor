import { defineConfig } from '@rsbuild/core';

import { pluginI18nextExtractor } from '../../src/index.js';

export default defineConfig({
  source: {
    entry: {
      index: './src/index',
    },
  },
  output: {
    target: 'node',
    minify: false,
    filename: {
      js: '[name].cjs',
    },
  },
  plugins: [
    pluginI18nextExtractor({
      localesDir: './locales',
    }),
  ],
});
