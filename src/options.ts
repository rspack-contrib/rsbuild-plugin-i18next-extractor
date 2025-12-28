import type { I18nextToolkitConfig as RawI18nextToolkitConfig } from 'i18next-cli';

type ExtractConfigWithOptionalFields = Omit<
  RawI18nextToolkitConfig['extract'],
  'input' | 'output'
> & {
  input?: RawI18nextToolkitConfig['extract']['input'];
  output?: RawI18nextToolkitConfig['extract']['output'];
};

export type I18nextToolkitConfig = Omit<
  RawI18nextToolkitConfig,
  'extract' | 'locales'
> & {
  extract?: ExtractConfigWithOptionalFields;
  locales?: string[];
};

export interface PluginI18nextExtractorOptions {
  /**
   * The directory which contains the raw locale translations.
   *
   * Supports both relative and absolute paths:
   * - Relative path: Resolved relative to the project root directory (e.g., './locales', 'src/locales')
   * - Absolute path: Used as-is (e.g., '/absolute/path/to/locales')
   *
   * @example
   * // Relative path
   * { localesDir: './locales' }
   *
   * @example
   * // Absolute path
   * { localesDir: '/Users/username/project/locales' }
   */
  localesDir: string;
  /**
   * The configuration of i18next-cli toolkit.
   */
  i18nextToolkitConfig?: I18nextToolkitConfig;
  /**
   * Custom callback function invoked when a translation key is not found in the locale file.
   *
   * By default, a warning is logged to the console with the missing key and file information.
   *
   * @param key - The translation key that was not found
   * @param locale - The locale identifier (e.g., 'en', 'zh-CN')
   * @param localeFilePath - The path to the locale file
   * @param entryName - The name of the current entry being processed
   *
   * @example
   * {
   *   onKeyNotFound: (key, locale, localeFilePath, entryName) => {
   *     console.error(`Missing key: ${key} in ${locale}`);
   *   }
   * }
   */
  onKeyNotFound?: (
    key: string,
    locale: string,
    localeFilePath: string,
    entryName: string,
  ) => void;
}
