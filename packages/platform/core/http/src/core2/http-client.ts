// import Axios from 'axios';

// import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
// import type {
//   AjaxConfigOptions,
//   HttpClient,
//   HttpClientConfig,
//   HttpClientHooks,
//   PendingRequest,
// } from './core.types';

// /** 生成请求唯一标识 */
// const generateRequestKey = (config: AjaxConfigOptions): string => {
//   return `${config.method?.toUpperCase() || 'GET'}:${config.url || ''}`;
// };

// /** 创建HTTP客户端 */
// export const createHttpClient = (options: HttpClientConfig = {}): HttpClient => {
//   // 从配置中提取相关选项，并设置默认值
//   const {
//     hooks: initialHooks = {},
//     tokenHeaderKey = 'Authorization',
//     enableCancelDuplicate = true,
//     ...axiosConfig
//   } = options;

//   // 创建Axios实例
//   const instance = Axios.create(axiosConfig) as HttpClient;
//   let hooks: HttpClientHooks = { ...initialHooks };
//   const pendingRequests = new Map<string, PendingRequest>();

//   /** 添加请求到待处理列表 */
//   const addPendingRequest = (config: AjaxConfigOptions) => {
//     if (!enableCancelDuplicate || !config.pltConfig?.cancelRequest) return;

//     // 1. 生成请求唯一标识
//     const key = generateRequestKey(config);

//     // 2. 如果存在相同请求，取消之前的请求
//     if (pendingRequests.has(key)) {
//       pendingRequests.get(key)?.cancel(`Duplicate request cancelled[重复请求已取消]: ${key}`);
//       pendingRequests.delete(key);
//     }

//     // 3. 添加当前请求到待处理列表
//     const source = Axios.CancelToken.source();
//     config.cancelToken = source.token;
//     config.cancelKey = key;
//     pendingRequests.set(key, { cancel: source.cancel, timestamp: Date.now() });
//   };

//   /** 移除待处理请求 */
//   const removePendingRequest = (config: AjaxConfigOptions) => {
//     pendingRequests.delete(config.cancelKey || generateRequestKey(config));
//   };

//   // 请求拦截器
//   instance.interceptors.request.use(
//     async (config: AjaxConfigOptions) => {
//       // 添加请求到待处理列表
//       addPendingRequest(config);

//       // 请求前钩子
//       if (hooks.getHeaders) {
//         config.headers = {
//           ...config.headers,
//           ...hooks.getHeaders(config.headers),
//         };
//       }

//       // 设置Authorization - getToken 返回完整的设置Authorization值（如 “Bearer xxx”）
//       if (hooks.getToken) {
//         const authorization = hooks.getToken();
//         if (authorization) {
//           config.headers[tokenHeaderKey] = authorization;
//           config.headers.client = 'text';
//         }
//       }

//       return hooks.beforeRequest ? hooks.beforeRequest(config) : config;
//     },
//     error => Promise.reject(error)
//   );

//   // 响应拦截器
//   instance.interceptors.response.use(
//     async (response: AxiosResponse) => {
//       removePendingRequest(response.config);
//       return hooks.afterResponse ? hooks.afterResponse(response) : response;
//     },
//     async error => {
//       if (error.config) removePendingRequest(error.config);
//       if (Axios.isCancel(error)) return Promise.reject(error);

//       if (hooks.onHttpError) await hooks.onHttpError(error, instance);
//       return Promise.reject(error);
//     }
//   );

//   // 扩展方法
//   instance.hooks = hooks;
//   instance.setHooks = (newHooks: Partial<HttpClientHooks>) => {
//     hooks = { ...hooks, ...newHooks };
//     instance.hooks = hooks;
//   };
//   instance.getPendingCount = (): number => pendingRequests.size;
//   instance.cancelAllRequests = (message = 'All requests cancelled'): void => {
//     pendingRequests.forEach((pending, key) => pending.cancel(`${message}: ${key}`));
//     pendingRequests.clear();
//   };

//   return instance;
// };

// /** 创建基础Axios实例 */
// export const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance =>
//   Axios.create(config);

// /** 检查错误是否为取消请求导致 */
// export const isRequestCancelled = (error: unknown): boolean => Axios.isCancel(error);
