import { userAccessStore } from '@admin-vue/stores';
import { envVariables } from '@admin-vue/utils/env-var';
import { createPlatformHttp } from './common/http';

const tokenAdapterHandler = () => {
  return {
    getToken: () => {
      const userAccess = userAccessStore();
      const token = userAccess.getAccessToken();
      return token ? token : null;
    },
    setToken: (token: string) => {
      const userAccess = userAccessStore();
      userAccess.setAccessToken(token);
    },
    clearToken: () => {
      const userAccess = userAccessStore();
      userAccess.removeAccessToken();
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
