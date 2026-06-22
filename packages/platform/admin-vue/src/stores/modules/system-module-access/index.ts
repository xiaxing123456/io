import type {
  MenuTreeOptions,
  SystemModuleAccessState,
  TabBarListOptions,
} from '@admin-vue/stores/modules/system-module-access/index.type';

import { MenuStatus } from '@admin-vue/enums/global.enum';
import { PiniaName } from '@admin-vue/stores/index.enum';
import { defineStore } from 'pinia';
import { reactive, readonly } from 'vue';

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

export const systemModuleAccessStore = defineStore(
  PiniaName.SystemModuleAccess,
  () => {
    /** 初始store的值 */
    const initialState = (): SystemModuleAccessState => ({
      activeTabFullPath: '',
      navigationType: null,
      [MenuStatus.CompanyManagement]: {
        menulist: [],
        tabBarlist: [],
        cachedViewNames: [],
      },
      [MenuStatus.CompanyPerson]: {
        menulist: [],
        tabBarlist: [],
        cachedViewNames: [],
      },
    });

    /** 数据 */
    const state = reactive(initialState());

    /** 方法 */
    const actions = {
      /**
       * 设置菜单列表
       * @param data
       */
      setMenuList(data: MenuTreeOptions[]) {
        if (data.length === 0 || !state.navigationType) return;
        const navigationType = state.navigationType;
        // 1.更新菜单导航
        state[navigationType].menulist = data;
        // 2.清理菜单里已经不存在的非固定tab
        state[navigationType].tabBarlist = state[navigationType].tabBarlist.filter(tab => {
          if (tab.affix) return true;
          return hasMenuByUrl(data, tab.fullPath);
        });

        if (state.navigationType === navigationType) {
          // 清理菜单里已经不存在的非固定tab
          state.tabBarlist = state.tabBarlist.filter(tab => {
            if (tab.affix) return true;
            return hasMenuByUrl(data, tab.fullPath);
          });
        } else {
          // 清空 tab
          actions.closeAllTabs();

          // 寻找第一个可用菜单
          const defaultMenu = findFirstAvailableMenu(data);
          if (!defaultMenu) return;
          // 创建 tab
          const defaultTab = createTabByMenu(defaultMenu);
          const hasDefaultTab = state.tabBarlist.some(tab => tab.fullPath === defaultTab.fullPath);

          // 添加 tab
          if (!hasDefaultTab) {
            state.tabBarlist.unshift(defaultTab);
          }
        }

        if (!state.activeTabFullPath) {
          state.activeTabFullPath = defaultTab.fullPath;
        }

        // 2.判断是否更新菜单模式
        if (state.navigationType !== navigationType) {
          state.navigationType = navigationType;
        }
      },

      /**
       * 设置导航栏列表
       * @param data
       */
      setTabBarList(data: TabBarListOptions[]) {
        state.tabBarlist = data;
      },

      /** 设置当前激活 tab */
      setActiveTab(fullPath: string) {
        state.activeTabFullPath = fullPath;
      },
      /** 当前路由进入 tab：不存在则新增 */
      addTab(tab: TabBarListOptions) {
        const tabIndex = state.tabBarlist.findIndex(item => item.fullPath === tab.fullPath);
        if (tabIndex === -1) {
          state.tabBarlist.push(tab);
        } else {
          state.tabBarlist.splice(tabIndex, 1, { ...state.tabBarlist[tabIndex], ...tab });
        }
      },

      /** 关闭指定 tab */
      removeTab(fullPath: string) {
        const tab = state.tabBarlist.find(item => item.fullPath === fullPath);
        state.tabBarlist = state.tabBarlist.filter(item => item.fullPath !== fullPath);

        // 如果激活的 tab 被关闭，则设置激活的 tab 为第一个 tab
        if (state.activeTabFullPath === fullPath) {
          state.activeTabFullPath = state.tabBarlist[0]?.fullPath || '';
        }

        // 移除缓存的组件
        if (tab?.componentName) {
          actions.removeCachedView(tab.componentName);
        }
      },

      /** 关闭其他 tab，保留首页/固定 tab 和当前 tab */
      closeOtherTabs(fullPath: string) {
        const removeTabs = state.tabBarlist.filter(
          item => !item.affix && item.fullPath !== fullPath
        );

        state.tabBarlist = state.tabBarlist.filter(
          item => item.affix || item.fullPath === fullPath
        );
        state.activeTabFullPath = fullPath;

        removeTabs.forEach(item => {
          if (item.componentName) {
            actions.removeCachedView(item.componentName);
          }
        });
      },

      /** 关闭全部可关闭 tab，保留首页/固定 tab */
      closeAllTabs() {
        const removeTabs = state.tabBarlist.filter(item => !item.affix);

        state.tabBarlist = state.tabBarlist.filter(item => item.affix);
        state.activeTabFullPath = state.tabBarlist[0]?.fullPath || '';

        removeTabs.forEach(item => {
          if (item.componentName) {
            actions.removeCachedView(item.componentName);
          }
        });
      },

      /** 添加缓存组件名 */
      addCachedView(name: string) {
        if (!name || state.cachedViewNames.includes(name)) return;

        state.cachedViewNames.push(name);
      },

      /** 删除缓存组件名 */
      removeCachedView(name: string) {
        state.cachedViewNames = state.cachedViewNames.filter(item => item !== name);
      },
    };

    return {
      state: readonly(state),
      ...actions,
    };
  },
  {
    // 持久化
    persist: {
      pick: ['tabBarlist', 'menulist', 'activeTabFullPath', 'cachedViewNames'],
    },
  }
);
