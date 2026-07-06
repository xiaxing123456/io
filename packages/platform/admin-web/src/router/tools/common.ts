import { RouteLocationNormalizedLoaded } from 'vue-router';
import { RouteMetaCustomizeOpsKey } from '../index.enum';

/**
 * # 是否是忽略登录的路由
 * @param route vue-route 当前 useRoute实例
 * @returns
 */
export const isIgnoreLoginPath = (route: RouteLocationNormalizedLoaded) => {
  const isIgnoreLogin = route.meta?.[RouteMetaCustomizeOpsKey.Name]?.isIgnoreLogin;
  return !!isIgnoreLogin;
};
