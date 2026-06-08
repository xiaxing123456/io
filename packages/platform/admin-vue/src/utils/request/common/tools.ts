// ==================== Headers构建 ====================

import { getCurrentRouterQuery } from '@admin-vue/utils/method/path';
import { TokenAdapter } from '@admin-vue/utils/request/index.type';
// ==================== Token管理 ====================

/** 内部token存储（当未注入tokenAdapter时使用） */
let tokenStorage: string | null = null;

/** 外部注入的token适配器 */
let tokenAdapter: TokenAdapter | null = null;

/**
 * 设置token适配器
 * 由应用层注入实际的token管理实现
 */
export const setTokenAdapter = (adapter: TokenAdapter): void => {
  tokenAdapter = adapter;
};

export const tokenManager = {
  getToken: (): string | null => {
    if (tokenAdapter) return tokenAdapter.getToken();
    return tokenStorage;
  },
  setToken: (token: string): void => {
    if (tokenAdapter) {
      tokenAdapter.setToken(token);
    } else {
      tokenStorage = token;
    }
  },
  clearAccessToken: (): void => {
    if (tokenAdapter?.clearToken) {
      tokenAdapter.clearToken();
    } else {
      tokenStorage = null;
    }
  },
  getAuthorization: (): string | null => {
    if (tokenAdapter) return tokenAdapter.getToken();
    return tokenStorage;
  },
};

export const buildHeaders = (headers?: Record<string, string>): Record<string, string> => {
  const { pathId, rePathId } = getCurrentRouterQuery();

  return {
    ...headers,
    'dms-path-id': headers?.['dms-path-id'] ?? pathId ?? '',
    'dms-re-path-id': headers?.['dms-re-path-id'] ?? rePathId ?? '',
  };
};
