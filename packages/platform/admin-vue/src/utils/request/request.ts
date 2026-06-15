import { coreAccessStore } from '@admin-vue/stores';
import { envVariables } from '@admin-vue/utils/env-var';
import { createPlatformHttp } from './common/http';

const tokenAdapterHandler = () => {
  return {
    getToken: () => {
      const accessStore = coreAccessStore();
      const token = accessStore.getAccessToken();
      return token ? token : null;
    },
    setToken: (token: string) => {
      const accessStore = coreAccessStore();
      accessStore.setAccessToken(token);
    },
    clearToken: () => {
      const accessStore = coreAccessStore();
      accessStore.removeAccessToken();
    },
  };
};

/**
 * 创建平台 HTTP 客户端实例
 */
const http = createPlatformHttp({
  baseURL: envVariables.baseUrl,
  tokenAdapter: tokenAdapterHandler,
});

export default http;
