import type { Locale } from 'vue-i18n';
import { ImportLocaleFn } from './typing';

/**
 * 加载带有目录结构的区域设置模块
 ```* @param regexp - 用于匹配语言和文件名的正则表达式```
 ```* @param modules - 包含路径和导入函数的模块对象```
 ```* @returns 一个映射，将语言环境与其对应的导入函数关联起来```
 */
export const loadLocalesMapFromDir = (
    regexp: RegExp,
    modules: Record<string, () => Promise<unknown>>
): Record<Locale, ImportLocaleFn> => {
    const localesRaw: Record<Locale, Record<string, () => Promise<unknown>>> = {};
    const localesMap: Record<Locale, ImportLocaleFn> = {};

    // Iterate over the modules to extract language and file names
    for (const path in modules) {
        const match = path.match(regexp);
        if (match) {
            const [_, locale, fileName] = match;
            if (locale && fileName) {
                if (!localesRaw[locale]) {
                    localesRaw[locale] = {};
                }
                if (modules[path]) {
                    localesRaw[locale][fileName] = modules[path];
                }
            }
        }
    }

    // Convert raw locale data into async import functions
    for (const [locale, files] of Object.entries(localesRaw)) {
        localesMap[locale] = async () => {
            const messages: Record<string, any> = {};
            for (const [fileName, importFn] of Object.entries(files)) {
                const content = ((await importFn()) as any)?.default;
                // 合并翻译内容，而不是嵌套在文件名下
                Object.assign(messages, content);
            }
            return { default: messages };
        };
    }

    return localesMap;
};
