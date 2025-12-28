import * as path from 'node:path';

import type { Rspack } from '@rsbuild/core';

import { getLocaleVariableName } from './utils.js';

interface LoaderOptions {
  localesDir: string;
}

/**
 * This loader will replace the export of i18n translations JSON file
 * with a variable placeholder.
 *
 * @example
 * ```js
 * // Before:
 * module.exports = { "hello": "World" }
 *
 * // After:
 * module.exports = __I18N_<LOCALE>_EXTRACTED_TRANSLATIONS__
 * ```
 *
 * The `__I18N_<LOCALE>_EXTRACTED_TRANSLATIONS__` will be replaced in Webpack/Rspack ProcessAssets hook
 * with the actual extracted translations for that locale.
 */
export default function loader(
  this: Rspack.LoaderContext<LoaderOptions>,
  source: string,
): void {
  const { localesDir } = this.getOptions();

  const absoluteLocalesDir = path.isAbsolute(localesDir)
    ? localesDir.replaceAll(path.sep, '/')
    : path.posix.join(this.rootContext, localesDir);

  const match = new RegExp(`${absoluteLocalesDir}/(.*)\\.json`).exec(
    this.resourcePath.replaceAll(path.sep, '/'),
  );

  if (!match || match.length < 2) {
    this.callback(null, `module.exports = ${source}`);
    return;
  }

  const locale = match[1];
  const replacement = getLocaleVariableName(locale);

  // For JSON files, we need to export the placeholder
  // Since JSON is treated as a module, we use module.exports
  this.callback(null, `module.exports = ${replacement}`);
}
