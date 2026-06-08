import type { App } from 'vue';

import { unref } from 'vue';
import { createI18n, Locale } from 'vue-i18n';
import { loadLocalesMapFromDir } from './tools';
import { LoadMessageFn, LocaleSetupOptions, SystemLanguage } from './typing';

const i18n = createI18n({
    globalInjection: true,
    legacy: false,
    locale: '',
    messages: {},
});
const modules = import.meta.glob('./langs/**/*.json');

/**
 * @zh_CN 本地语言包映射
 * @en_US Language package mapping
 */
const localesMap = loadLocalesMapFromDir(/\.\/langs\/([^/]+)\/(.*)\.json$/, modules);

/**
 * @zh_CN 加载语言包函数
 * @en_US Load language package function
 */
let loadMessages: LoadMessageFn;

/**
 * @zh_CN 设置语言
 * @param locale
 */
function setI18nLanguage(locale: Locale) {
    i18n.global.locale.value = locale;

    document?.querySelector('html')?.setAttribute('lang', locale);
}

/**
 * @zh_CN 加载语言包
 * @en_US Load language package
 */
const loadLocaleMessages = async (lang: SystemLanguage) => {
    // 语言包已存在
    if (unref(i18n.global.locale) === lang) {
        return setI18nLanguage(lang);
    }

    // 语言包不存在
    // 加载语言包
    const message = await localesMap[lang]?.();
    if (message?.default) {
        i18n.global.setLocaleMessage(lang, message.default);
    }

    // 加载合并语言包
    const mergeMessage = await loadMessages(lang);
    i18n.global.mergeLocaleMessage(lang, mergeMessage);

    // 设置语言
    return setI18nLanguage(lang);
};

/**
 * @zh_CN 语言初始化
 * @en_US Language initialization
 */
const setupI18n = async (app: App, options: LocaleSetupOptions = {}) => {
    const { defaultLocale = SystemLanguage.ZhCn } = options;

    // app可以自行扩展一些第三方库和组件库的国际化
    loadMessages = options.loadMessages || (async () => ({}));

    app.use(i18n);

    await loadLocaleMessages(defaultLocale);
};

export { i18n, setupI18n };
