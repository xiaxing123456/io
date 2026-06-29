import type {
  MenuTreeOptions,
  TabBarListOptions,
} from '@admin-vue/stores/modules/system-module-access/index.type';

import { MenuStatus } from '@admin-vue/enums/global.enum';

export const useHelper = () => {
  /** 获取相反导航类型 */
  const getOppositeNavigationType = (type: MenuStatus) => {
    return type === MenuStatus.CompanyManagement
      ? MenuStatus.CompanyPerson
      : MenuStatus.CompanyManagement;
  };

  /** 格式化菜单 url */
  const formatUrl = (node: MenuTreeOptions): MenuTreeOptions => {
    const { url } = node;
    const urlParams: Record<string, string> = {
      menuCode: node.menuCode,
      navigationType: `${node.navigationType}`,
    };
    const urlParamsString = new URLSearchParams(urlParams).toString();
    const newUrl = url ? `${url}?${urlParamsString}` : '';
    node.url = newUrl;
    return node;
  };

  /**
   * 获取第一个可用的菜单
   * @param menus
   */
  const findFirstAvailableMenu = (menus: MenuTreeOptions[]): MenuTreeOptions | undefined => {
    for (const menu of menus) {
      if (menu.url) return menu;

      const child = findFirstAvailableMenu(menu.children || []);
      if (child) return child;
    }
  };

  /** 获取菜单 */
  const findMenuByUrl = (menus: MenuTreeOptions[], url?: string): MenuTreeOptions | undefined => {
    if (!url) return;

    for (const menu of menus) {
      if (menu.url === url) return menu;

      const child = findMenuByUrl(menu.children || [], url);
      if (child) return child;
    }
  };

  /**
   * 判断菜单是否存在
   * @param menus
   * @param url
   */
  const hasMenuByUrl = (menus: MenuTreeOptions[], url?: string): boolean => {
    if (!url) return true;

    return menus.some(menu => {
      if (menu.url === url) return true;
      return hasMenuByUrl(menu.children || [], url);
    });
  };

  /** 创建 */
  const createTabByMenu = (menu: MenuTreeOptions): TabBarListOptions => ({
    title: menu.menuName,
    path: menu.url,
    fullPath: menu.url,
    menuCode: menu.menuCode,
    navigationType: menu.navigationType,
    icon: menu.menuSvgId,
    affix: true,
    closable: false,
  });

  return {
    getOppositeNavigationType,
    formatUrl,
    findFirstAvailableMenu,
    findMenuByUrl,
    createTabByMenu,
    hasMenuByUrl,
  };
};
