/**
 * 语言代码转换工具
 * 将常见的语言代码格式转换为平台统一格式
 */

/**
 * 语言代码映射表
 * 键：常见的语言代码格式（如 'zh-CN', 'en-US'）
 * 值：平台使用的语言代码格式（如 'zh', 'en'）
 */
const languageCodeMap: Record<string, string> = {
    'zh-CN': 'zh',
    'zh-TW': 'zh_TW',
    'en-US': 'en',
    'en-GB': 'en_GB',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'fr-FR': 'fr',
    'de-DE': 'de',
    'es-ES': 'es',
    'it-IT': 'it',
    'pt-PT': 'pt',
    'ru-RU': 'ru',
};

/**
 * 转换语言代码为平台统一格式
 *
 * @param lang - 原始语言代码（如 'zh-CN', 'en-US'）
 * @returns 平台统一格式的语言代码（如 'zh', 'en'）
 *
 * @example
 * ```typescript
 * convertLanguageCode('zh-CN') // 'zh'
 * convertLanguageCode('en-US') // 'en'
 * convertLanguageCode('unknown') // 'unknown' (未匹配时返回原值)
 * ```
 */
export const convertLanguageCode = (lang: string): string => {
    return languageCodeMap[lang] || lang;
};
