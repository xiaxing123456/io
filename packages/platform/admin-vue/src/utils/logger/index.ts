import { PltLogger } from '@io-platform/core-common';

import { LoggerTrigger } from '@admin-vue/utils/logger/index.enum';
import { envVariables } from '../env-var';

/**
 * ## 生成自定义控制台 log 对象
 * - 打印日志, 使用方法和 console 一致
 */
export const generateCustomizeLogger = () => {
  const useLogger = envVariables.loggerTrigger === LoggerTrigger.On;
  return PltLogger.generateCustomizeLogger({ useLogger });
};
