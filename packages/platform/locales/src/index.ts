import { i18n, setupI18n } from './i18n';
import { loadLocalesMapFromDir } from './tools';
import { LocaleSetupOptions, SystemLanguage } from './typing';

const $t = i18n.global.t;
const $te = i18n.global.te;

export type { CompileError } from '@intlify/core-base';
export { $t, $te, i18n, loadLocalesMapFromDir, setupI18n, SystemLanguage };
export type { LocaleSetupOptions };
