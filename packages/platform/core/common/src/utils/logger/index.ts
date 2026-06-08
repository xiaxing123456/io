import { GetLogFunctionByLevel } from './index.types';
// console 禁用规则忽略此文件
// 此模块文件用来封装全局 console

import { LogLevel } from './index.enum';
import { emptyFn } from '../pure-function';

const getLogFunctionByLevel: GetLogFunctionByLevel = options => {
    if (options?.level === LogLevel.Info) {
        // eslint-disable-next-line no-console
        return console.info.bind(console, '[info]: ');
    }

    if (options?.level === LogLevel.Warn) {
        // eslint-disable-next-line no-console
        return console.warn.bind(console, '[warn]: ');
    }

    if (options?.level === LogLevel.Error) {
        // eslint-disable-next-line no-console
        return console.error.bind(console, '[error]: ');
    }

    // eslint-disable-next-line no-console
    return console.log.bind(console, '[log]: ');
};

/**
 * ## 生成自定义控制台 log 对象
 * - 打印日志, 使用方法和 console 一致
 */
export const generateCustomizeLogger = (options?: { useLogger: boolean }) => {
    const useLogger = options?.useLogger;

    return {
        log: useLogger ? getLogFunctionByLevel() : emptyFn,
        info: useLogger
            ? getLogFunctionByLevel({
                  level: LogLevel.Info,
              })
            : emptyFn,
        warn: useLogger
            ? getLogFunctionByLevel({
                  level: LogLevel.Warn,
              })
            : emptyFn,
        error: useLogger
            ? getLogFunctionByLevel({
                  level: LogLevel.Error,
              })
            : emptyFn,
    };
};
