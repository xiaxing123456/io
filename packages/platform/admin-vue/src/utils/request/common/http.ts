import { createHttpClient, type HttpClient } from '@io-platform/core-http';
import { PlatformHttpConfig } from '../index.type';
import { createPlatformHooks } from './hooks';
import { setTokenAdapter } from './tools';

export const createPlatformHttp = (config: PlatformHttpConfig): HttpClient => {
  const { baseURL, timeout, tokenAdapter } = config;

  // 配置token适配器
  if (tokenAdapter) {
    setTokenAdapter(tokenAdapter);
  }

  // 使用延迟获取解决循环引用
  let httpInstance: HttpClient;

  const hooks = createPlatformHooks({});

  httpInstance = createHttpClient({
    baseURL,
    timeout,
    hooks,
    tokenHeaderKey: 'Authorization',
  });

  return httpInstance;
};
