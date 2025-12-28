import { createRequire } from 'node:module';


import type { RsbuildPlugin } from '@rsbuild/core';
import { logger } from '@rsbuild/core';

import { I18nextExtractorWebpackPlugin } from './I18nextExtractorWebpackPlugin.js';
import type { PluginI18nextExtractorOptions } from './options.js';
import { resolveLocalesDir } from './utils.js';

const require = createRequire(import.meta.url);

/**
 * A Rsbuild plugin for extracting i18n translations using i18next-cli.
 *
 * This plugin automatically scans your source code for i18n translation keys
 * and extracts only used keys from your locale files. This helps reduce
 * bundle size by only including translations that are actually used in your code.
 *
 * @example
 * ```ts
 * // rsbuild.config.ts
 * import { defineConfig } from '@rsbuild/core'
 * import { pluginI18nextExtractor } from 'rsbuild-plugin-i18next-extractor';
 *
 * export default defineConfig({
 *   plugins: [
 *     pluginI18nextExtractor({
 *       localesDir: './locales'
 *     })
 *   ],
 * })
 * ```
 *
 * @public
 */
export function pluginI18nextExtractor(
  pluginOptions: PluginI18nextExtractorOptions,
): RsbuildPlugin {
  return {
    name: 'rsbuild:i18next-extractor',
    setup(api) {
      validateOptions(pluginOptions);

      const { localesDir, i18nextToolkitConfig, onKeyNotFound } = pluginOptions;

      api.modifyBundlerChain((chain) => {
        // Add a rule to replace locale JSON imports with a placeholder
        chain.module
          .rule('i18next-extractor:i18n-translations-replacement')
          .test(/\.json$/)
          .type('javascript/auto')
          .include.add(resolveLocalesDir(api.context.rootPath, localesDir))
          .end()
          .use('i18n-translations-replacement')
          .loader(require.resolve('./loader.js'))
          .options({ localesDir })
          .end()
          .end()
          .end()
          .plugin(I18nextExtractorWebpackPlugin.name)
          .use(I18nextExtractorWebpackPlugin, [
            {
              localesDir,
              i18nextToolkitConfig,
              onKeyNotFound,
              logger,
            },
          ])
          .end();
      });
    },
  };
}

function validateOptions(pluginOptions: PluginI18nextExtractorOptions): void {
  if (
    !pluginOptions ||
    !pluginOptions.localesDir ||
    pluginOptions.localesDir.trim() === ''
  ) {
    throw new Error(
      '[rsbuild-plugin-i18next-extractor] The "localesDir" option is required.',
    );
  }
}
