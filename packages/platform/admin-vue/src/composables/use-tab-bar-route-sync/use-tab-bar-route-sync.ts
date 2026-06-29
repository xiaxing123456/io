import type { RouteLocationNormalizedLoaded } from 'vue-router';

import { RouteMetaCustomizeOpsKey } from '@admin-vue/router/index.enum';
import { adminAccessStore } from '@admin-vue/stores';
import { TabBarListOptions } from '@admin-vue/stores/modules/admin-access/index.type';

export const useTabBarRouteSync = () => {
  const adminAccess = adminAccessStore();

  const createTabFromRoute = (route: RouteLocationNormalizedLoaded): TabBarListOptions | null => {
    const menuMap = adminAccess.getMenuMap();
    const menu = menuMap.get(route.fullPath);
    const customizeOps = route.meta?.[RouteMetaCustomizeOpsKey.Name] || {};
    if (!menu) return null;

    return {
      title: menu.menuName,
      path: menu.url,
      fullPath: menu.fullUrl,
      routeName: route.name as string,
      menuCode: menu.menuCode,
      navigationType: menu.navigationType,
      icon: menu?.menuSvgId,
      affix: !!customizeOps.affix,
      closable: !customizeOps.affix,
      keepAlive: !!customizeOps.keepAlive,
      componentName: route.name as string,
    };
  };

  /**
   * ## 同步路由到标签栏
   * - 该方法会根据路由的 meta.customizeOps.hiddenTab 判断是否隐藏标签
   * - 该方法会根据路由的 meta.customizeOps.keepAlive 判断是否缓存标签
   * @param route 路由对象
   */
  const syncRouteToTab = (route: RouteLocationNormalizedLoaded) => {
    const tab = createTabFromRoute(route);
    if (!tab) return;
    adminAccess.addTabBar(tab);
  };

  return {
    syncRouteToTab,
  };
};
