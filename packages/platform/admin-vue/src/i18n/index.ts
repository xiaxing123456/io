import { $t as t } from '@locales';
import { setupI18n } from './setup';

const $t = (val: string, params: AnyObj = {}) => {
  return t(`admin-vue.${val}`, params);
};

export { $t, setupI18n };
