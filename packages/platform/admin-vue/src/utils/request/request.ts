import { coreAccessStore } from '@admin-vue/stores';
import { envVariables } from '@admin-vue/utils/env-var';
import { createPlatformHttp } from './common/http';

const accessStore = coreAccessStore();
/**
 * 创建平台 HTTP 客户端实例
 */
const http = createPlatformHttp({
  baseURL: envVariables.baseUrl,
  tokenAdapter: {
    getToken: () => {
      const token = accessStore.getAccessToken();
      return token ? token : null;
    },
    setToken: (token: string) => {
      accessStore.setAccessToken(token);
    },
    clearToken: () => {
      accessStore.removeAccessToken();
    },
  },
});

export default http;
