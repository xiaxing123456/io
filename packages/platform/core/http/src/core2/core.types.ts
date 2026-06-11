// /**
//  * 核心层类型定义
//  */

// import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';

// /** 平台配置扩展 */
// export interface PltConfig {
//   /**
//    * 是否隐藏Toast
//    * @default false
//    */
//   hideToast?: boolean;
//   /**
//    * 是否取消请求
//    * @default false

//    */
//   cancelRequest?: boolean;
//   /**
//    * 是否刷新Token
//    * @default false
//    */
//   isRefreshToken?: boolean;
//   /**
//    * 是否返回响应数据中的data字段
//    * @default false
//    */
//   resBaseData?: boolean;
// }

// /** 扩展的Axios配置 */
// export interface AjaxConfigOptions extends AxiosRequestConfig {
//   /** 平台配置 */
//   pltConfig?: PltConfig;
//   /** 请求唯一标识 */
//   cancelKey?: string;
// }

// /** HTTP客户端钩子 */
// export interface HttpClientHooks {
//   /**  获取请求头 */
//   getHeaders?: (headers?: Record<string, string>) => Record<string, string>;
//   /**  获取Token */
//   getToken?: () => string | null;
//   /**  请求拦截 */
//   beforeRequest?: (config: AjaxConfigOptions) => Promise<AjaxConfigOptions> | AjaxConfigOptions;
//   /**  响应拦截 */
//   afterResponse?: (response: AxiosResponse) => Promise<AxiosResponse> | AxiosResponse;
//   /**  错误处理 */
//   onHttpError?: (error: AxiosError, http: AxiosInstance) => Promise<void> | void;
// }

// /** HTTP客户端配置 */
// export interface HttpClientConfig extends AxiosRequestConfig {
//   /** HTTP客户端钩子 */
//   hooks?: HttpClientHooks;
//   /** 获取Token的请求头字段名 */
//   tokenHeaderKey?: string;
//   /** 是否启用取消重复请求 */
//   enableCancelDuplicate?: boolean;
// }

// /** 待处理请求 */
// export interface PendingRequest {
//   /** 取消请求的函数 */
//   cancel: Canceler;
//   timestamp: number;
// }

// /** Form下载选项 */
// export interface FormDownloadOptions {
//   /** 是否隐藏错误提示 */
//   hideToast?: boolean;
// }

// /** HTTP客户端实例 */
// export interface HttpClient extends AxiosInstance {
//   hooks: HttpClientHooks;
//   setHooks: (hooks: Partial<HttpClientHooks>) => void;
//   getPendingCount: () => number;
//   cancelAllRequests: (message?: string) => void;
//   /** Form表单下载 - GET（需配置formDownload） */
//   reqGetFileForForm?: (
//     url: string,
//     data?: Record<string, any>,
//     options?: FormDownloadOptions
//   ) => Promise<any>;
//   /** Form表单下载 - POST（需配置formDownload） */
//   reqPostFileForForm?: (
//     url: string,
//     data?: Record<string, any>,
//     options?: FormDownloadOptions
//   ) => Promise<any>;
// }

// /** 文件流配置 */
// export interface FileStreamConfig extends AjaxConfigOptions {
//   fileName?: string;
//   blobOption?: BlobPropertyBag;
// }

// /** 文件上传数据 */
// export interface UploadData {
//   fileName: string;
//   fileList: File[];
//   options?: Record<string, any>;
// }
