/**
 * @io-platform/core-http - HTTP 客户端库
 *
 * 分层设计：
 * - core: 核心HTTP客户端（可独立拆包）
 * - business: 业务层封装（依赖core）
 */

// ==================== 核心层 ====================
export {
  ContentTypeEnum,
  createAxiosInstance,
  createHttpClient,
  createRequestMethods,
  HttpMethodEnum,
  HttpStatusCode,
  isRequestCancelled,
} from './core';

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
} from './core';

// ==================== Axios类型 ====================

export type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Canceler,
  CancelToken,
  CancelTokenSource,
} from 'axios';

// ==================== 工具 ====================

export {
  base64ToBlob,
  blobToBase64,
  createBlob,
  downloadBlob,
  downloadFileStream,
  extractFileName,
  isJsonBlob,
  isOctetStream,
  isResBlob,
  resBlobToJson,
} from './utils';
