import type { PlatformHttpConfig, TokenAdapter } from '@admin-web/utils/request/index.type';
import type {
  AjaxConfigOptions,
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  HttpClient,
  HttpClientHooks,
} from '@io-platform/core-http';

import { CreateHttpClient } from '@io-platform/core-http';

import { router } from '@admin-web/router';
import { userAccessStore } from '@admin-web/stores/modules/user-access';
import { ElMessage } from 'element-plus';

export class CreatePlatformHttp {
  baseURL: string;
  timeout: number;
  hooks: HttpClientHooks;
  tokenManager: TokenAdapter;
  instance: HttpClient;

  constructor(config: PlatformHttpConfig) {
    const { baseURL, timeout } = config;
    this.baseURL = baseURL || '';
    this.timeout = timeout || 25000;
    this.tokenManager = this.tokenAdapterHandler();
    this.hooks = this.createPlatformHooks();
    this.instance = new CreateHttpClient({
      baseURL: this.baseURL,
      timeout: this.timeout,
      hooks: this.hooks,
      tokenHeaderKey: 'Authorization',
    }).instance;
  }

  tokenAdapterHandler(): TokenAdapter {
    return {
      getToken: () => {
        const userAccess = userAccessStore();
        return userAccess.getAccessToken;
      },
      setToken: (token: string) => {
        const userAccess = userAccessStore();
        userAccess.setToken({ accessToken: token });
      },
      clearToken: () => {
        const userAccess = userAccessStore();
        userAccess.clearToken();
      },
    };
  }

  /**
   * 创建平台级请求钩子
   */
  createPlatformHooks(): HttpClientHooks {
    return {
      getHeaders: () => ({}),
      getToken: () => this.tokenManager.getToken(),
      beforeRequest: (config: AjaxConfigOptions) => {
        const userAccess = userAccessStore();
        if (userAccess.loginStatus && userAccess.isCheckTimeout()) {
          ElMessage.error('登录已过期');
          // 1.清空登录状态
          userAccess.clearInfo();
          // 2.跳转登录页
          router.push('/login');
          return Promise.reject(new Error('登录已过期'));
        }
        return config;
      },
      afterResponse: (response: AxiosResponse) => {
        const ajaxConfig = response.config as AjaxConfigOptions;

        // 业务失败处理
        if (!response?.data?.success) {
          const msg = response.data?.message;

          // 是否隐藏Toast 默认显示
          if (!ajaxConfig?.pltConfig?.hideToast && msg) ElMessage.error(msg);
          return Promise.reject(response);
        }
        return response;
      },
      onHttpError: async (error: AxiosError, instance: AxiosInstance) => {},
    };
  }
}
