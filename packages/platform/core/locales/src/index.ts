import { i18n, loadLocaleMessages, setupI18n } from './i18n';
import { loadLocalesMapFromDir } from './tools';
import { LocaleSetupOptions, SystemLanguage } from './typing';

const $t = i18n.global.t;
const $te = i18n.global.te;

export { $t, $te, i18n, loadLocaleMessages, loadLocalesMapFromDir, setupI18n, SystemLanguage };
export type { LocaleSetupOptions };
