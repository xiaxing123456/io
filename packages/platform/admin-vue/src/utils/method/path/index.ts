import { pathUtils } from '@io-platform/core-common';

/**
 * 获取当前路由的参数
 */
export const getCurrentRouterQuery = () => {
  const hash = globalThis?.location?.hash;
  return pathUtils.getPathQueryForHref(hash) as Record<string, string>;
};

/**
 * 获取当前路由的完整路径
 */
export const getCurrentRouterUrlFullPath = () => {
  const hash = globalThis?.location?.hash;
  return pathUtils.getUrlFullPath(hash);
};
