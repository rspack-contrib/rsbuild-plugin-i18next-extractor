import { defineConfig } from 'vitest/config';

const config = defineConfig({
  test: {
    globalSetup: ['test/helpers/setup-loader.js'],
  },
});

export default config;
