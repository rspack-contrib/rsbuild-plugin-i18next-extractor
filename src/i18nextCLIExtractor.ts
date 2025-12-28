/**
 * @packageDocumentation
 *
 * An extractor based i18next-cli is used with `rsbuild-plugin-i18next-extractor`.
 */
import { extract } from 'i18next-cli';
import type { I18nextToolkitConfig } from './options.js';

export async function extractTranslationKeys(
  files: string[],
  locales: string[],
  i18nextToolkitConfig?: I18nextToolkitConfig,
) {
  const extractResult = await extract({
    ...i18nextToolkitConfig,
    locales,
    extract: {
      input: files,
      output:
        'node_modules/.rsbuild-plugin-i18next-extractor/locales/{{language}}/{{namespace}}.json',
      ...i18nextToolkitConfig?.extract,
    },
  });

  // Group keys by locale
  const translationsKeysByLocale: Record<string, string[]> = {};

  for (const result of extractResult) {
    // Extract locale from path (support both Unix and Windows paths)
    // Example paths:
    // Unix: '/path/to/node_modules/.rsbuild-plugin-i18next-extractor/locales/zh-CN/translation.json'
    // Windows: 'C:\\path\\to\\node_modules\\.rsbuild-plugin-i18next-extractor\\locales\\zh-CN\\translation.json'
    const pathMatch = result.path?.match(/[/\\]locales[/\\]([^/\\]+)[/\\]/);
    const locale = pathMatch?.[1];

    if (locale && result.newTranslations) {
      const keys = Object.keys(
        result.newTranslations as Record<string, string>,
      );

      if (!translationsKeysByLocale[locale]) {
        translationsKeysByLocale[locale] = [];
      }

      // Add keys for this locale (avoiding duplicates)
      translationsKeysByLocale[locale] = Array.from(
        new Set([...translationsKeysByLocale[locale], ...keys]),
      );
    }
  }

  return translationsKeysByLocale;
}
