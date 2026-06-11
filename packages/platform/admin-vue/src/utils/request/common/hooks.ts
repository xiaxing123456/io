import { buildHeaders, tokenManager } from '@admin-vue/utils/request/common/tools';
import {
  AjaxConfigOptions,
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  HttpClientHooks,
} from '@io-platform/core-http';
import { ElMessage } from 'element-plus';
import { PlatformHooksConfig } from '../index.type';

/**
 * 创建平台钩子
 */
export const createPlatformHooks = (config: PlatformHooksConfig): HttpClientHooks => {
  return {
    getHeaders: headers => buildHeaders(headers),
    getToken: () => tokenManager.getAuthorization(),
    afterResponse: async (response: AxiosResponse) => {
      const ajaxConfig = response.config as AjaxConfigOptions;
      // 业务失败处理
      if (!response?.data?.success) {
        const msg = response.data?.message;

        // 是否隐藏Toast 默认显示
        if (!ajaxConfig?.pltConfig?.hideToast) ElMessage.error(msg);
        return Promise.reject(response);
      }
      return response;
    },
    onHttpError: async (error: AxiosError, instance: AxiosInstance) => {},
  };
};
