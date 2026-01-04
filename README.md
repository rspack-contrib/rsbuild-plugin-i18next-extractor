# rsbuild-plugin-i18next-extractor

<p>
  <a href="https://npmjs.com/package/rsbuild-plugin-i18next-extractor">
   <img src="https://img.shields.io/npm/v/rsbuild-plugin-i18next-extractor?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/rsbuild-plugin-i18next-extractor?minimal=true"><img src="https://img.shields.io/npm/dm/rsbuild-plugin-i18next-extractor.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

A Rsbuild plugin for extracting i18n translations using [i18next-cli](https://github.com/i18next/i18next-cli). 

## Why

`i18next-cli` can extract i18n translations from your source code through [`extract.input`](https://github.com/i18next/i18next-cli?tab=readme-ov-file#1-initialize-configuration). However some i18n translations will be bundled together with your code even if they are not used.

This plugin uses the Rspack module graph to override the `extract.input` configuration with imported modules, generating i18n translations based on usage.

## Installation

```bash
npm add rsbuild-plugin-i18next-extractor --save-dev
```

## Usage

### Install

```ts
// rsbuild.config.ts
import { pluginI18nextExtractor } from 'rsbuild-plugin-i18next-extractor';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  plugins: [
    pluginI18nextExtractor({
      localesDir: './locales',
    }),
  ],
});
```

### Directory Structure

Your project should have a locales directory with JSON files:

```
locales/
  en.json
  zh.json
  ja.json
```

**NOTE:** `rsbuild-plugin-i18next-extractor` only supports `*.json` files.


### Using i18n in your code

```js
// ./src/i18n.js
import i18next from 'i18next';
import en from '../locales/en.json';
import zh from '../locales/zh.json';

const i18n = i18next.createInstance()

i18n.init({
  lng: 'en',
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    }
  }
})

export { i18n }
```

use `i18n.t('key')` to translate

```js
// src/index.js
import { i18n } from './i18n';

console.log(i18n.t('hello'));
```

## Options

### `localesDir`

- **Type:** `string`
- **Required:** Yes

The directory containing your locale JSON files.

Supports both relative and absolute paths:
- Relative path: Resolved relative to the project root directory (e.g., `'./locales'`, `'src/locales'`)
- Absolute path: Used as-is (e.g., `'/absolute/path/to/locales'`)

```ts
pluginI18nextExtractor({
  localesDir: './locales',
});
```

### `i18nextToolkitConfig`

- **Type:** `I18nextToolkitConfig`
- **Required:** No

The configuration for i18next-cli toolkit. This allows you to customize how translation keys are extracted from your code.

See [i18next-cli configuration](https://github.com/i18next/i18next-cli) for available options.

```ts
pluginI18nextExtractor({
  localesDir: './locales',
  i18nextToolkitConfig: {
    extract: {
      // Custom extraction configuration
    },
  },
});
```

#### Ignoring Files

- **Type:** `string | string[] | undefined`
- **Required:** No

You can use the `extract.ignore` option to exclude certain files from translation extraction. This is useful for avoiding extraction from third-party code, or other files that shouldn't be scanned for translations.

The `i18nextToolkitConfig.extract.ignore` option supports **glob patterns** and can be either a string or an array of strings:

```ts
pluginI18nextExtractor({
  localesDir: './locales',
  i18nextToolkitConfig: {
    extract: {
      // Ignore a single pattern
      ignore: 'node_modules/**',
    },
  },
});
```

```ts
pluginI18nextExtractor({
  localesDir: './locales',
  i18nextToolkitConfig: {
    extract: {
      // Ignore multiple patterns
      ignore: [
        'node_modules/**',
        'packages/**',
      ],
    },
  },
});
```

### `onKeyNotFound`

- **Type:** `(key: string, locale: string, localeFilePath: string, entryName: string) => void`
- **Required:** No

Custom callback function invoked when a translation key is not found in the locale file.

By default, a warning is logged to the console with the missing key and file information.

**Parameters:**
- `key` - The translation key that was not found
- `locale` - The locale identifier (e.g., `'en'`, `'zh-CN'`)
- `localeFilePath` - The path to the locale file
- `entryName` - The name of the current entry being processed

```ts
pluginI18nextExtractor({
  localesDir: './locales',
  onKeyNotFound: (key, locale, localeFilePath, entryName) => {
    console.error(`Missing key: ${key} in ${locale}`);
  },
});
```

## Credits

[rsbuild-plugin-tailwindcss](https://github.com/rspack-contrib/rsbuild-plugin-tailwindcss) - Inspiration for this plugin

## License

[MIT](./LICENSE)
