// // 开发模式特殊处理
// if (import.meta.env.DEV) {
//     window.DMS_PIMC_PROXY = {
//         basePath: import.meta.env.VITE_BASE_URL,
//         baseUrl: import.meta.env.VITE_BASE_URL,
//         socketUrl: import.meta.env.VITE_SOCKET_URL,
//         loggerTrigger: import.meta.env.VITE_LOGGER_TRIGGER,
//     };
// }

/** 环境变量 */
export const envVariables = {
    /** 是否是开发模式 */
    isDev: import.meta.env.DEV,
    /** 当前版本 */
    version: import.meta.env.VITE_VERSION,
    /** 应用名称 */
    name: import.meta.env.VITE_NAMESPACE,
    /** 是否触发日志 */
    loggerTrigger: import.meta.env.VITE_LOGGER_TRIGGER,
};
