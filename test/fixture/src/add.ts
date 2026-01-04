import { i18n } from './i18n';

export function add(a: number, b: number) {
  console.log(i18n.t('add'));
  return a + b;
}
