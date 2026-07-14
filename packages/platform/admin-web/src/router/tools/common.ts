import { RouteMetaCustomizeOpsKey } from '@admin-web/router/index.enum';
import { RouteLocationNormalizedLoaded } from 'vue-router';

/**
 * # 是否是忽略登录的路由
 * @param route vue-route 当前 useRoute实例
 * @returns
 */
export const isIgnoreLoginPath = (route: RouteLocationNormalizedLoaded) => {
  const isIgnoreLogin = route.meta?.[RouteMetaCustomizeOpsKey.Name]?.isIgnoreLogin;
  return !!isIgnoreLogin;
};
