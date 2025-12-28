/** biome-ignore-all lint/style/noNonNullAssertion: ignore test files */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRsbuild, type RsbuildConfig } from '@rsbuild/core';
import { beforeAll, describe, expect, it } from 'vitest';
import { pluginI18nextExtractor } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, 'fixture');

describe('rsbuild-plugin-i18next-extractor', () => {
  const distDir = path.join(fixtureDir, 'dist');

  beforeAll(async () => {
    // Clean up previous build artifacts
    await fs.rm(distDir, { recursive: true, force: true });
  });

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
      }),
    ],
  };

  it('should extract only used i18n keys after build', async () => {
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

    // Check that English translations variable is defined
    expect(distContent).toContain('__I18N_EN_EXTRACTED_TRANSLATIONS__');

    // Check that Chinese translations variable is defined
    expect(distContent).toContain('__I18N_ZH_CN_EXTRACTED_TRANSLATIONS__');

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

    // Verify English translations contain only used keys
    expect(enTranslations).toHaveProperty('title');
    expect(enTranslations.title).toBe('Welcome to i18next-extractor');

    expect(enTranslations).toHaveProperty('look');
    expect(enTranslations.look).toEqual({ deep: 'Look deep' });

    expect(enTranslations).toHaveProperty('interpolation');
    expect(enTranslations.interpolation).toBe('{{what}} is {{how}}');

    expect(enTranslations).toHaveProperty('key_one');
    expect(enTranslations.key_one).toBe('item');

    expect(enTranslations).toHaveProperty('key_other');
    expect(enTranslations.key_other).toBe('items');

    // Verify unused keys are NOT included
    expect(enTranslations).not.toHaveProperty('unused');

    // Verify Chinese translations contain only used keys
    expect(zhTranslations).toHaveProperty('title');
    expect(zhTranslations.title).toBe('欢迎使用 i18next-extractor');

    expect(zhTranslations).toHaveProperty('look');
    expect(zhTranslations.look).toEqual({ deep: '深入查找' });

    expect(zhTranslations).toHaveProperty('interpolation');
    expect(zhTranslations.interpolation).toBe('{{what}} 是 {{how}}');

    expect(zhTranslations).toHaveProperty('key_other');
    expect(zhTranslations.key_other).toBe('个');

    // Verify unused keys are NOT included
    expect(zhTranslations).not.toHaveProperty('unused');
  });
});
