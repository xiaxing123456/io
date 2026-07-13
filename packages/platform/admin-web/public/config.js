/**
 * 此配置是提供给平台工程的
 * 为了编译打包后，在部署的时候还可以更改代理前缀、日志是否打印
 */
const proxyVariables = {
    /** 普通请求代理前缀 */
    baseUrl: '/api',
    /** webscoket代理前缀 */
    socketUrl: '/socketApi',
    /** 是否打印日志 */
    loggerTrigger: 'off',
};
window.DMS_PIMC_PROXY = proxyVariables;
