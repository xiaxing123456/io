/**
 * 核心层类型定义
 */

import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/** 平台配置扩展 */
export interface PltConfig {
  /**
   * 是否隐藏Toast
   * @default false
   */
  hideToast?: boolean;

  /**
   * 新请求开始时，取消相同 cancelKey 的旧请求
   * @default false
   */
  cancelPrevious?: boolean;

  /** 请求取消分组，不传则使用 hooks.getCancelScope 或默认 global */
  cancelScope?: string;

  /** 请求取消 key，不传则使用 hooks.getCancelKey 或默认 method:url */
  cancelKey?: string;

  /**
   * 是否刷新Token
   * @default false
   */
  isRefreshToken?: boolean;

  /**
   * 是否返回 AxiosResponse 原始数据
   * @default false
   */
  resBaseData?: boolean;
}

/** HTTP客户端实例 */
export interface HttpClient extends AxiosInstance {
  hooks: HttpClientHooks;
  setHooks: (hooks: Partial<HttpClientHooks>) => void;
  getPendingCount: (scopeId?: string) => number;
  getPendingRequests: (scopeId?: string) => PendingRequest[];
  cancelAllRequests: (message?: string) => void;
  cancelRequestsByScope: (scopeId: string, message?: string) => void;
  cancelRequestsByKey: (cancelKey: string, message?: string) => void;

  /** Form表单下载 - GET（需配置formDownload） */
  reqGetFileForForm?: (
    url: string,
    data?: Record<string, any>,
    options?: FormDownloadOptions
  ) => Promise<any>;

  /** Form表单下载 - POST（需配置formDownload） */
  reqPostFileForForm?: (
    url: string,
    data?: Record<string, any>,
    options?: FormDownloadOptions
  ) => Promise<any>;
}

/** HTTP客户端配置 */
export interface HttpClientConfig extends AxiosRequestConfig {
  /** HTTP客户端钩子 */
  hooks?: HttpClientHooks;
  /** 获取Token的请求头字段名 */
  tokenHeaderKey?: string;
}

/** HTTP客户端钩子 */
export interface HttpClientHooks {
  /**  获取请求头 */
  getHeaders?: (headers?: Record<string, string>) => Record<string, string>;
  /**  获取Token */
  getToken?: () => string | null;
  /**  请求拦截 */
  beforeRequest?: (config: AjaxConfigOptions) => Promise<AjaxConfigOptions> | AjaxConfigOptions;
  /**  响应拦截 */
  afterResponse?: (response: AxiosResponse) => Promise<AxiosResponse> | AxiosResponse;
  /**  错误处理 */
  onHttpError?: (error: AxiosError, http: AxiosInstance) => Promise<void> | void;

  /** 生成请求取消 scope */
  getCancelScope?: (config: AjaxConfigOptions) => string | undefined;

  /** 生成请求取消 key */
  getCancelKey?: (config: AjaxConfigOptions) => string | undefined;
}

/** 扩展的Axios配置 */
export interface AjaxConfigOptions extends AxiosRequestConfig {
  /** 平台配置 */
  pltConfig?: PltConfig;

  /** 内部字段：真实请求 ID */
  __requestId?: symbol;

  /** 内部字段：最终解析后的取消 key */
  __cancelKey?: string;

  /** 内部字段：最终解析后的取消 scope */
  __cancelScope?: string;

  /** 内部字段：清理外部 signal 监听器 */
  __cancelCleanup?: () => void;
}

/** 待处理请求 */
export interface PendingRequest {
  /** 请求唯一 ID */
  requestId: symbol;

  /** 请求取消 key */
  cancelKey: string;

  /** 请求取消 scope */
  scopeId: string;

  /** 取消控制器 */
  controller: AbortController;

  /** 取消请求的函数 */
  cancel: () => void;

  /** 创建时间 */
  timestamp: number;
}

/** Form下载选项 */
export interface FormDownloadOptions {
  /** 是否隐藏错误提示 */
  hideToast?: boolean;
}

/** 文件流配置 */
export interface FileStreamConfig extends AjaxConfigOptions {
  fileName?: string;
  blobOption?: BlobPropertyBag;
}

/** 文件上传数据 */
export interface UploadData {
  fileName: string;
  fileList: File[];
  options?: Record<string, any>;
}
