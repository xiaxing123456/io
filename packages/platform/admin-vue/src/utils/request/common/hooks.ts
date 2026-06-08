import { buildHeaders, tokenManager } from '@admin-vue/utils/request/common/tools';
import { AxiosError, AxiosInstance, AxiosResponse, HttpClientHooks } from '@io-platform/core-http';
import { PlatformHooksConfig } from '../index.type';

/**
 * 创建平台钩子
 */
export const createPlatformHooks = (config: PlatformHooksConfig): HttpClientHooks => {
  return {
    getHeaders: headers => buildHeaders(headers),
    getToken: () => tokenManager.getAuthorization(),
    afterResponse: async (response: AxiosResponse) => {
      return response;
    },
    onHttpError: async (error: AxiosError, instance: AxiosInstance) => {},
  };
};
