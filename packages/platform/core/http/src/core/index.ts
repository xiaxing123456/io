/**
 * 核心层入口
 * 可独立拆包使用
 */

// HTTP客户端
export { createAxiosInstance, createHttpClient, isRequestCancelled } from './http-client';

// 方法
export { createRequestMethods } from './http-methods';

// 枚举
export { ContentTypeEnum, HttpMethodEnum, HttpStatusCode } from './core.enum';

// 类型
export type {
  AjaxConfigOptions,
  FileStreamConfig,
  FormDownloadOptions,
  HttpClient,
  HttpClientConfig,
  HttpClientHooks,
  PendingRequest,
  PltConfig,
  UploadData,
} from './core.types';
