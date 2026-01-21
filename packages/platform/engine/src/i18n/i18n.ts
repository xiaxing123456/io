import type { LocaleSetupOptions } from '@locales';
import type { App } from 'vue';

import { setupI18n as coreSetup, loadLocalesMapFromDir, SystemLanguage } from '@locales';

const modules = import.meta.glob('./langs/**/*.json');
const localesMap = loadLocalesMapFromDir(/\.\/langs\/([^/]+)\/(.*)\.json$/, modules);

/**
 * 加载应用特有的语言包
 * 这里也可以改造为从服务端获取翻译数据
 * @param lang
 */
async function loadMessages(lang: SystemLanguage) {
    const [appLocaleMessages] = await Promise.all([localesMap[lang]?.()]);
    return appLocaleMessages?.default;
}

export const setupI18n = async (app: App, options: LocaleSetupOptions = {}) => {
    await coreSetup(app, {
        defaultLocale: SystemLanguage.ZhCn,
        loadMessages,
    });
};
