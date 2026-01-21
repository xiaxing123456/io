import { generateCustomizeLogger } from '@engine/utils/logger';
/**
 * ## 挂载全局(window)变量
 * - 所有全局变量从此入口挂载
 */
const mountGlobalVar = () => {
    window.logger = generateCustomizeLogger();
};

mountGlobalVar();

export { mountGlobalVar };
