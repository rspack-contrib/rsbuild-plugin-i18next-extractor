import { readdirSync } from 'node:fs';
import * as path from 'node:path';

/**
 * Generate a variable name for storing extracted translations of a given locale.
 *
 * @example
 * getLocaleVariableName('zh-CN') // Returns: '__I18N_ZH_CN_EXTRACTED_TRANSLATIONS__'
 */
export function getLocaleVariableName(locale: string): string {
  return `__I18N_${locale.toUpperCase().replaceAll('-', '_')}_EXTRACTED_TRANSLATIONS__`;
}

/**
 * Get list of locales from the locales directory.
 *
 * Locales are determined by JSON files in the directory.
 */
export function getLocalesFromDirectory(
  rootDir: string,
  localesDir: string,
): string[] {
  const files = readdirSync(resolveLocalesDir(rootDir, localesDir), {
    withFileTypes: true,
  });

  return files
    .filter((file) => !file.isDirectory() && file.name.endsWith('.json'))
    .map<string>(({ name: filename }) => filename.replace('.json', ''));
}

/**
 * Resolve the absolute path to the locales directory.
 *
 * If the locales directory is already absolute, returns it as-is.
 * Otherwise, resolves it relative to the root directory.
 */
export function resolveLocalesDir(rootDir: string, localesDir: string): string {
  return path.isAbsolute(localesDir)
    ? localesDir
    : path.resolve(rootDir, localesDir);
}

/**
 * Resolve the absolute path to a specific locale's JSON file.
 *
 * @param localesDir - The locales directory (absolute or relative)
 * @param locale - The locale identifier (e.g., 'zh-CN', 'en')
 * @param rootDir - The root directory for resolving relative paths
 * @returns The absolute path to the locale JSON file
 */
export function resolveLocaleFilePath(
  localesDir: string,
  locale: string,
  rootDir: string,
): string {
  return path.join(
    path.isAbsolute(localesDir)
      ? localesDir
      : path.resolve(rootDir, localesDir),
    `${locale}.json`,
  );
}
