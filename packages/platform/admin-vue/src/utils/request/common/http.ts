import type { HttpClient } from '@io-platform/core-http';

import { CreateHttpClient } from '@io-platform/core-http';
import { PlatformHttpConfig } from '../index.type';
import { createPlatformHooks } from './hooks';
import { setTokenAdapter } from './tools';

export const createPlatformHttp = (config: PlatformHttpConfig): HttpClient => {
  const { baseURL, timeout, tokenAdapter } = config;

  // 配置token适配器
  if (tokenAdapter) {
    setTokenAdapter(tokenAdapter);
  }

  const hooks = createPlatformHooks({});

  const createHttpClient = new CreateHttpClient({
    baseURL,
    timeout,
    hooks,
    tokenHeaderKey: 'Authorization',
  });

  return createHttpClient.instance;
};
