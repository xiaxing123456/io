import { i18n, loadLocaleMessages, SystemLanguage, $t as t } from '@locales';
import { setupI18n } from './setup';

const $t = (val: string, params: AnyObj = {}) => {
  return t(`admin-vue.${val}`, params);
};

const localeOptions = [
  {
    label: '中文（简体）',
    value: SystemLanguage.ZhCn,
  },
  {
    label: 'English',
    value: SystemLanguage.EnUs,
  },
];

export { $t, i18n, loadLocaleMessages, localeOptions, setupI18n, SystemLanguage };
