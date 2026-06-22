import type {
  MenuTreeOptions,
  TabBarListOptions,
} from '@admin-vue/stores/modules/system-module-access/index.type';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

import { MenuStatus } from '@admin-vue/enums/global.enum';
import { RouteMetaCustomizeOpsKey } from '@admin-vue/router/index.enum';
import { systemModuleAccessStore } from '@admin-vue/stores';

export const useTabBarRouteSync = () => {
  const systemModuleAccess = systemModuleAccessStore();
  const findMenuByCode = (
    menus: MenuTreeOptions[],
    menuCode: string
  ): MenuTreeOptions | undefined => {
    for (const menu of menus) {
      if (menu.menuCode === menuCode) return menu;

      const child = findMenuByCode(menu.children || [], menuCode);
      if (child) return child;
    }
  };

  const createTabFromRoute = (route: RouteLocationNormalizedLoaded): TabBarListOptions => {
    const customizeOps = route.meta?.[RouteMetaCustomizeOpsKey.Name] || {};
    const menuCode = String(route.query.menuCode || '');
    const menu = findMenuByCode(systemModuleAccess.state.menulist as MenuTreeOptions[], menuCode);

    return {
      title: menu?.menuName || String(route.meta.title || route.name || route.path),
      path: route.fullPath,
      fullPath: route.fullPath,
      routeName: route.name ? String(route.name) : undefined,
      menuCode,
      navigationType: route.query.navigationType as unknown as MenuStatus,
      icon: menu?.menuSvgId || customizeOps.icon,
      affix: !!customizeOps.affix,
      closable: !customizeOps.affix,
      keepAlive: !!customizeOps.keepAlive,
      componentName: route.name ? String(route.name) : undefined,
    };
  };

  /**
   * ## 同步路由到标签栏
   * - 该方法会根据路由的 meta.customizeOps.hiddenTab 判断是否隐藏标签
   * - 该方法会根据路由的 meta.customizeOps.keepAlive 判断是否缓存标签
   * @param route 路由对象
   */
  const syncRouteToTab = (route: RouteLocationNormalizedLoaded) => {
    const customizeOps = route.meta?.[RouteMetaCustomizeOpsKey.Name] || {};

    // 是否隐藏标签
    if (customizeOps.hiddenTab) return;

    const tab = createTabFromRoute(route);
    systemModuleAccess.addTab(tab);
    systemModuleAccess.setActiveTab(tab.fullPath);

    if (tab.keepAlive && tab.componentName) {
      systemModuleAccess.addCachedView(tab.componentName);
    }
  };

  return {
    syncRouteToTab,
  };
};
