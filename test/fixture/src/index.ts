import { i18n } from './i18n';

console.log(i18n.t('title'));
console.log(i18n.t('look.deep'));
console.log(i18n.t('interpolation', { what: 'i18next', how: 'great' }));
console.log(i18n.t('key', { count: 1 }));
console.log(i18n.t('key', { count: 5 }));
