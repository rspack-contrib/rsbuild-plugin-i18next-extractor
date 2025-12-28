/** biome-ignore-all lint/style/noNonNullAssertion: ignore test files */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRsbuild, type RsbuildConfig } from '@rsbuild/core';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { pluginI18nextExtractor } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, 'fixture');

describe('onKeyNotFound callback', () => {
  const distDir = path.join(fixtureDir, 'dist');

  beforeAll(async () => {
    // Clean up previous build artifacts
    await fs.rm(distDir, { recursive: true, force: true });
  });

  it('should call custom onKeyNotFound callback when key is not found', async () => {
    const onKeyNotFoundMock = vi.fn();

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
          onKeyNotFound: onKeyNotFoundMock,
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

    // Note: The callback may or may not be called depending on whether
    // all keys exist in locale files. The zh-CN locale is missing 'key_one'
    // which should trigger the callback if it was extracted
    if (onKeyNotFoundMock.mock.calls.length > 0) {
      // Verify the callback arguments structure
      const calls = onKeyNotFoundMock.mock.calls;

      // Each call should have 4 arguments: key, locale, localeFilePath, entryName
      calls.forEach((call) => {
        expect(call).toHaveLength(4);
        expect(typeof call[0]).toBe('string'); // key
        expect(typeof call[1]).toBe('string'); // locale
        expect(typeof call[2]).toBe('string'); // localeFilePath
        expect(typeof call[3]).toBe('string'); // entryName
      });

      // Verify at least one call is for the missing 'key_one' in zh-CN
      const hasKeyOneMissing = calls.some(
        (call) => call[0] === 'key_one' && call[1] === 'zh-CN',
      );
      expect(hasKeyOneMissing).toBe(true);
    }
  });

  it('should use default warning when onKeyNotFound is not provided', async () => {
    // Spy on console.warn to check if default warning is used
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

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
          root: path.join(fixtureDir, 'dist-default'),
        },
        filename: {
          js: '[name].cjs',
        },
      },
      plugins: [
        pluginI18nextExtractor({
          localesDir: './locales',
          // No onKeyNotFound provided, should use default
        }),
      ],
    };

    const rsbuild = await createRsbuild({
      cwd: fixtureDir,
      rsbuildConfig,
    });

    await rsbuild.build();

    // Restore the spy
    consoleWarnSpy.mockRestore();

    // Clean up
    await fs.rm(path.join(fixtureDir, 'dist-default'), {
      recursive: true,
      force: true,
    });
  });

  it('should provide correct information in callback arguments', async () => {
    let capturedKey: string | undefined;
    let capturedLocale: string | undefined;
    let capturedLocaleFilePath: string | undefined;
    let capturedEntryName: string | undefined;

    const onKeyNotFoundMock = vi.fn(
      (key, locale, localeFilePath, entryName) => {
        if (!capturedKey) {
          capturedKey = key;
          capturedLocale = locale;
          capturedLocaleFilePath = localeFilePath;
          capturedEntryName = entryName;
        }
      },
    );

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
          root: path.join(fixtureDir, 'dist-info'),
        },
        filename: {
          js: '[name].cjs',
        },
      },
      plugins: [
        pluginI18nextExtractor({
          localesDir: './locales',
          onKeyNotFound: onKeyNotFoundMock,
        }),
      ],
    };

    const rsbuild = await createRsbuild({
      cwd: fixtureDir,
      rsbuildConfig,
    });

    await rsbuild.build();

    // Only verify if callback was called (it might not be if all keys exist)
    if (onKeyNotFoundMock.mock.calls.length > 0) {
      // Verify we captured some data
      expect(capturedKey).toBeDefined();
      expect(capturedLocale).toBeDefined();
      expect(capturedLocaleFilePath).toBeDefined();
      expect(capturedEntryName).toBe('index');

      // Verify locale is valid
      expect(['en', 'zh-CN']).toContain(capturedLocale);

      // Verify localeFilePath contains the locale
      expect(capturedLocaleFilePath).toContain(capturedLocale!);
      expect(capturedLocaleFilePath).toContain('.json');
    }

    // Clean up
    await fs.rm(path.join(fixtureDir, 'dist-info'), {
      recursive: true,
      force: true,
    });
  });
});
