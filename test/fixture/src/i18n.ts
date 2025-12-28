import i18next from 'i18next';
import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';

const i18n = i18next.createInstance();

i18n.init({
  lng: 'en',
  resources: {
    en: {
      translation: en,
    },
    'zh-CN': {
      translation: zhCN,
    },
  },
});

export { i18n };
