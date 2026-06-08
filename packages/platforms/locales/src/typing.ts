/**
 * 系统语言枚举
 */
export enum SystemLanguage {
    /** 英语 */
    EnUs = 'en-US',
    /** 简体中文 */
    ZhCn = 'zh-CN',
}

export type ImportLocaleFn = () => Promise<{ default: Record<string, string> }>;

export type LoadMessageFn = (lang: SystemLanguage) => Promise<Record<string, string> | undefined>;

/**
 * @zh_CN 国际化配置项
 */
export interface LocaleSetupOptions {
    /**
     * Default language
     * @default zh-CN
     */
    defaultLocale?: SystemLanguage;
    /**
     * Load message function
     * @param lang
     * @returns
     */
    loadMessages?: LoadMessageFn;
}
