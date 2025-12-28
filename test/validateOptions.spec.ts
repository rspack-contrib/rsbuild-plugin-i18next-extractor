/** biome-ignore-all lint/suspicious/noExplicitAny: ignore */
import { describe, expect, it } from 'vitest';
import { pluginI18nextExtractor } from '../src/index.js';

describe('validateOptions', () => {
  // Mock API context for setup function
  const createMockApi = () => ({
    context: {
      rootPath: '/test/root',
    },
    modifyBundlerChain: () => {},
  });

  it('should throw error when localesDir is missing', () => {
    expect(() => {
      const plugin = pluginI18nextExtractor({} as any);
      plugin.setup(createMockApi() as any);
    }).toThrow(
      '[rsbuild-plugin-i18next-extractor] The "localesDir" option is required.',
    );
  });

  it('should throw error when localesDir is undefined', () => {
    expect(() => {
      const plugin = pluginI18nextExtractor({ localesDir: undefined } as any);
      plugin.setup(createMockApi() as any);
    }).toThrow(
      '[rsbuild-plugin-i18next-extractor] The "localesDir" option is required.',
    );
  });

  it('should throw error when localesDir is null', () => {
    expect(() => {
      const plugin = pluginI18nextExtractor({ localesDir: null } as any);
      plugin.setup(createMockApi() as any);
    }).toThrow(
      '[rsbuild-plugin-i18next-extractor] The "localesDir" option is required.',
    );
  });

  it('should throw error when localesDir is empty string', () => {
    expect(() => {
      const plugin = pluginI18nextExtractor({ localesDir: '' });
      plugin.setup(createMockApi() as any);
    }).toThrow(
      '[rsbuild-plugin-i18next-extractor] The "localesDir" option is required.',
    );
  });

  it('should throw error when localesDir is only whitespace', () => {
    expect(() => {
      const plugin = pluginI18nextExtractor({ localesDir: '   ' });
      plugin.setup(createMockApi() as any);
    }).toThrow(
      '[rsbuild-plugin-i18next-extractor] The "localesDir" option is required.',
    );
  });

  it('should not throw error when localesDir is provided', () => {
    expect(() => {
      pluginI18nextExtractor({ localesDir: './locales' });
    }).not.toThrow();
  });

  it('should not throw error when localesDir is an absolute path', () => {
    expect(() => {
      pluginI18nextExtractor({ localesDir: '/absolute/path/to/locales' });
    }).not.toThrow();
  });

  it('should not throw error when localesDir is provided with i18nextToolkitConfig', () => {
    expect(() => {
      pluginI18nextExtractor({
        localesDir: './locales',
        i18nextToolkitConfig: {
          extract: {
            defaultValue: '',
          },
        },
      });
    }).not.toThrow();
  });

  it('should create a valid plugin with required options', () => {
    const plugin = pluginI18nextExtractor({ localesDir: './locales' });

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('rsbuild:i18next-extractor');
    expect(typeof plugin.setup).toBe('function');
  });

  it('should create a valid plugin with all options', () => {
    const plugin = pluginI18nextExtractor({
      localesDir: './locales',
      i18nextToolkitConfig: {
        extract: {
          defaultValue: 'Missing translation',
        },
      },
    });

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('rsbuild:i18next-extractor');
    expect(typeof plugin.setup).toBe('function');
  });
});
