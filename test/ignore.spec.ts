/** biome-ignore-all lint/style/noNonNullAssertion: ignore test files */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRsbuild, type RsbuildConfig } from '@rsbuild/core';
import { beforeAll, describe, expect, it } from 'vitest';
import { pluginI18nextExtractor } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, 'fixture');

describe('rsbuild-plugin-i18next-extractor - ignore option', () => {
  const distDir = path.join(fixtureDir, 'dist-ignore');

  beforeAll(async () => {
    // Clean up previous build artifacts
    await fs.rm(distDir, { recursive: true, force: true });
  });

  it('should ignore files matching ignore patterns', async () => {
    const rsbuildConfig: RsbuildConfig = {
      source: {
        entry: {
          index: './src/index',
        },
      },
      output: {
        target: 'node',
        minify: false,
        distPath: {
          root: distDir,
        },
        filename: {
          js: '[name].cjs',
        },
      },
      plugins: [
        pluginI18nextExtractor({
          localesDir: './locales',
          i18nextToolkitConfig: {
            extract: {
              // Ignore add.ts file which contains the 'add' key
              ignore: '**/add.ts',
            },
          },
        }),
      ],
    };

    // Create rsbuild instance with the fixture config
    const rsbuild = await createRsbuild({
      cwd: fixtureDir,
      rsbuildConfig,
    });

    // Run the build
    await rsbuild.build();

    // Check if the build output exists
    const distIndexPath = path.join(distDir, 'index.cjs');
    const distIndexExists = await fs
      .access(distIndexPath)
      .then(() => true)
      .catch(() => false);
    expect(distIndexExists).toBe(true);

    // Read the output file
    const distContent = await fs.readFile(distIndexPath, 'utf-8');

    // Verify the output contains the extracted translations
    expect(distContent).toBeTruthy();
    expect(distContent.length).toBeGreaterThan(0);

    // Extract and parse the English translations
    const enTranslationsMatch = distContent.match(
      /const __I18N_EN_EXTRACTED_TRANSLATIONS__ = ({.*?});/s,
    );
    expect(enTranslationsMatch).toBeTruthy();
    const enTranslations = JSON.parse(enTranslationsMatch?.[1] || '{}');

    // Extract and parse the Chinese translations
    const zhTranslationsMatch = distContent.match(
      /const __I18N_ZH_CN_EXTRACTED_TRANSLATIONS__ = ({.*?});/s,
    );
    expect(zhTranslationsMatch).toBeTruthy();
    const zhTranslations = JSON.parse(zhTranslationsMatch![1]);

    // Verify English translations contain keys from index.ts
    expect(enTranslations).toHaveProperty('title');
    expect(enTranslations.title).toBe('Welcome to i18next-extractor');

    expect(enTranslations).toHaveProperty('look');
    expect(enTranslations.look).toEqual({ deep: 'Look deep' });

    expect(enTranslations).toHaveProperty('interpolation');
    expect(enTranslations.interpolation).toBe('{{what}} is {{how}}');

    // Verify the 'add' key from add.ts is NOT included (because add.ts is ignored)
    expect(enTranslations).not.toHaveProperty('add');

    // Verify Chinese translations contain keys from index.ts
    expect(zhTranslations).toHaveProperty('title');
    expect(zhTranslations.title).toBe('欢迎使用 i18next-extractor');

    expect(zhTranslations).toHaveProperty('look');
    expect(zhTranslations.look).toEqual({ deep: '深入查找' });

    // Verify the 'add' key from add.ts is NOT included
    expect(zhTranslations).not.toHaveProperty('add');
  });

  it('should ignore files matching multiple ignore patterns', async () => {
    const rsbuildConfig: RsbuildConfig = {
      source: {
        entry: {
          index: './src/index',
        },
      },
      output: {
        target: 'node',
        minify: false,
        distPath: {
          root: distDir,
        },
        filename: {
          js: '[name].cjs',
        },
      },
      plugins: [
        pluginI18nextExtractor({
          localesDir: './locales',
          i18nextToolkitConfig: {
            extract: {
              // Ignore multiple patterns
              ignore: ['**/add.ts', '**/*.test.ts', '**/__tests__/**'],
            },
          },
        }),
      ],
    };

    // Create rsbuild instance with the fixture config
    const rsbuild = await createRsbuild({
      cwd: fixtureDir,
      rsbuildConfig,
    });

    // Run the build
    await rsbuild.build();

    // Check if the build output exists
    const distIndexPath = path.join(distDir, 'index.cjs');
    const distIndexExists = await fs
      .access(distIndexPath)
      .then(() => true)
      .catch(() => false);
    expect(distIndexExists).toBe(true);

    // Read the output file
    const distContent = await fs.readFile(distIndexPath, 'utf-8');

    // Extract and parse the English translations
    const enTranslationsMatch = distContent.match(
      /const __I18N_EN_EXTRACTED_TRANSLATIONS__ = ({.*?});/s,
    );
    expect(enTranslationsMatch).toBeTruthy();
    const enTranslations = JSON.parse(enTranslationsMatch?.[1] || '{}');

    // Verify the 'add' key from add.ts is NOT included
    expect(enTranslations).not.toHaveProperty('add');

    // Verify keys from index.ts are still included
    expect(enTranslations).toHaveProperty('title');
    expect(enTranslations).toHaveProperty('look');
  });

  it('should work without ignore option', async () => {
    const rsbuildConfig: RsbuildConfig = {
      source: {
        entry: {
          index: './src/index',
        },
      },
      output: {
        target: 'node',
        minify: false,
        distPath: {
          root: distDir,
        },
        filename: {
          js: '[name].cjs',
        },
      },
      plugins: [
        pluginI18nextExtractor({
          localesDir: './locales',
          // No ignore option - should work as before
        }),
      ],
    };

    // Create rsbuild instance with the fixture config
    const rsbuild = await createRsbuild({
      cwd: fixtureDir,
      rsbuildConfig,
    });

    // Run the build
    await rsbuild.build();

    // Check if the build output exists
    const distIndexPath = path.join(distDir, 'index.cjs');
    const distIndexExists = await fs
      .access(distIndexPath)
      .then(() => true)
      .catch(() => false);
    expect(distIndexExists).toBe(true);

    // Read the output file
    const distContent = await fs.readFile(distIndexPath, 'utf-8');

    // Extract and parse the English translations
    const enTranslationsMatch = distContent.match(
      /const __I18N_EN_EXTRACTED_TRANSLATIONS__ = ({.*?});/s,
    );
    expect(enTranslationsMatch).toBeTruthy();
    const enTranslations = JSON.parse(enTranslationsMatch?.[1] || '{}');

    // When no ignore is specified, it should work as before
    // Keys that are actually used should be included
    expect(enTranslations).toHaveProperty('title');
    expect(enTranslations).toHaveProperty('look');
    expect(enTranslations).toHaveProperty('interpolation');

    // When no ignore is specified, 'add' key from add.ts SHOULD be included
    expect(enTranslations).toHaveProperty('add');
    expect(enTranslations.add).toBe('Add number');
  });
});
