import type { AxiosResponse } from 'axios';
import type {
  AjaxConfigOptions,
  HttpClient,
  HttpClientConfig,
  HttpClientHooks,
} from './core.types';

import Axios from 'axios';
import { RequestCancellationManager } from './RequestCancellationManager';

export class CreateHttpClient {
  /** Axios实例 */
  public instance!: HttpClient;
  /** hooks - 默认为空 */
  private hooks: HttpClientHooks = {};
  /** 获取Token的请求头字段名- 默认为 Authorization */
  private tokenHeaderKey = 'Authorization';
  /** 请求取消管理器 */
  private cancellationManager!: RequestCancellationManager;

  constructor(options: HttpClientConfig) {
    const { hooks, tokenHeaderKey, ...axiosConfig } = options;
    this.instance = Axios.create(axiosConfig) as HttpClient;
    this.hooks = hooks || {};
    this.tokenHeaderKey = tokenHeaderKey || 'Authorization';

    this.cancellationManager = new RequestCancellationManager({
      getHooks: () => this.hooks,
    });

    this.instance.hooks = this.hooks;
    this.instance.setHooks = (newHooks: Partial<HttpClientHooks>) => {
      this.hooks = { ...this.hooks, ...newHooks };
      this.instance.hooks = this.hooks;
    };
    this.instance.getPendingCount = scopeId => this.cancellationManager.getPendingCount(scopeId);
    this.instance.getPendingRequests = scopeId =>
      this.cancellationManager.getPendingRequests(scopeId);
    this.instance.cancelAllRequests = () => this.cancellationManager.cancelAllRequests();
    this.instance.cancelRequestsByScope = scopeId =>
      this.cancellationManager.cancelRequestsByScope(scopeId);
    this.instance.cancelRequestsByKey = cancelKey =>
      this.cancellationManager.cancelRequestsByKey(cancelKey);

    this.interceptorsRequest();
    this.interceptorsResponse();
  }

  /** 请求拦截器 */
  interceptorsRequest() {
    this.instance.interceptors.request.use(
      async config => {
        const ajaxConfig = config as AjaxConfigOptions;
        const headers = (ajaxConfig.headers ||= {});

        // 请求头钩子
        if (this.hooks.getHeaders) {
          Object.assign(headers, this.hooks.getHeaders(headers as Record<string, string>));
        }

        // 获取Token并添加到请求头
        if (this.hooks.getToken) {
          const authorization = this.hooks.getToken();
          if (authorization) {
            headers[this.tokenHeaderKey] = authorization;
            headers.client = 'text';
          }
        }

        // 请求请求拦截器钩子
        const nextConfig = this.hooks.beforeRequest
          ? await this.hooks.beforeRequest(ajaxConfig)
          : ajaxConfig;

        // 添加请求到待处理列表
        this.cancellationManager.attachCancellation(nextConfig);
        return nextConfig as typeof config;
      },
      error => Promise.reject(error)
    );
  }
  /** 响应拦截器 */
  interceptorsResponse() {
    this.instance.interceptors.response.use(
      async (response: AxiosResponse) => {
        this.cancellationManager.removePendingRequest(response.config);
        const newResponse = this.hooks.afterResponse
          ? this.hooks.afterResponse(response)
          : response;
        return newResponse;
      },
      async error => {
        if (error.config) this.cancellationManager.removePendingRequest(error.config);
        if (Axios.isCancel(error)) return Promise.reject(error);

        if (this.hooks.onHttpError) await this.hooks.onHttpError(error, this.instance);
        return Promise.reject(error);
      }
    );
  }
}
