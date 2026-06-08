import type { App } from 'vue';

import { unref } from 'vue';
import { createI18n, Locale } from 'vue-i18n';
import { loadLocalesMapFromDir } from './tools';
import { LoadMessageFn, LocaleSetupOptions, SystemLanguage } from './typing';

/**
 * 创建全局 i18n 实例。
 *
 * globalInjection: true
 * - 开启全局注入，模板中可以直接使用 $t、$te。
 *
 * legacy: false
 * - 使用 Vue I18n Composition API 模式。
 * - i18n.global.locale 是 ref，设置语言时需要使用 .value。
 *
 * locale: ''
 * - 初始化时暂不指定语言。
 * - 实际语言会在 setupI18n 中加载并设置。
 *
 * messages: {}
 * - 初始语言包为空，通过 import.meta.glob 动态加载。
 */
const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: '',
  messages: {},
});

/**
 * 使用 Vite import.meta.glob 扫描当前包内的语言包文件。
 *
 * 约定目录结构：
 *
 * src/langs/zh-CN/index.json
 * src/langs/en-US/index.json
 */
const modules = import.meta.glob('./langs/**/*.json');

/**
 * 本地语言包映射。
 *
 * 将 import.meta.glob 的扫描结果转换成按语言分组的加载函数：
 *
 * {
 *   'zh-CN': async () => ({ default: { ... } }),
 *   'en-US': async () => ({ default: { ... } })
 * }
 */
const localesMap = loadLocalesMapFromDir(/\.\/langs\/([^/]+)\/(.*)\.json$/, modules);

/**
 * 外部语言包加载函数。
 *
 * 由 setupI18n 的 options.loadMessages 传入，
 * 用于让业务应用加载并合并自己的语言包。
 */
let loadMessages: LoadMessageFn;

/**
 * 设置当前语言。
 *
 * @param locale 要切换的语言，例如 zh-CN、en-US
 */
function setI18nLanguage(locale: Locale) {
  // legacy: false 时，locale 是 ref，需要通过 .value 修改
  i18n.global.locale.value = locale;

  // 同步更新 html lang 属性，便于 SEO、无障碍和浏览器识别语言
  document?.querySelector('html')?.setAttribute('lang', locale);
}

/**
 * 加载并切换语言。
 *
 * 执行流程：
 * 1. 如果当前语言已经是目标语言，则直接返回
 * 2. 加载核心包内置语言包
 * 3. 加载业务应用扩展语言包
 * 4. 合并业务语言包
 * 5. 设置当前语言
 */
const loadLocaleMessages = async (lang: SystemLanguage) => {
  // 当前语言已是目标语言，无需重复加载
  if (unref(i18n.global.locale) === lang) {
    return setI18nLanguage(lang);
  }

  // 加载核心包内置语言包
  const message = await localesMap[lang]?.();
  if (message?.default) {
    i18n.global.setLocaleMessage(lang, message.default);
  }

  // 加载业务应用扩展语言包
  const mergeMessage = await loadMessages(lang);
  i18n.global.mergeLocaleMessage(lang, mergeMessage);

  // 语言包加载完成后再切换语言
  return setI18nLanguage(lang);
};

/**
 * 初始化国际化。
 *
 * @param app Vue 应用实例
 * @param options 国际化初始化配置
 */
const setupI18n = async (app: App, options: LocaleSetupOptions = {}) => {
  // 默认语言，未传入时使用简体中文
  const { defaultLocale = SystemLanguage.ZhCn } = options;

  // 保存业务扩展语言包加载函数；未传入时使用空函数
  loadMessages = options.loadMessages || (async () => ({}));

  // 安装 vue-i18n 插件
  app.use(i18n);

  // 加载默认语言包并设置当前语言
  await loadLocaleMessages(defaultLocale);
};

export { i18n, setupI18n };
