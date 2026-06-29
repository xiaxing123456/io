import type {
  AdminAccessState,
  MenuTreeOptions,
  TabBarListOptions,
} from '@admin-vue/stores/modules/admin-access/index.type';

import { queryMenuList } from '@admin-vue/apis/system';
import { MenuStatus } from '@admin-vue/enums/global.enum';
import { PiniaName } from '@admin-vue/stores/index.enum';
import { useHelper } from '@admin-vue/stores/modules/admin-access/helper';
import { sessionPersistStorage } from '@admin-vue/stores/persist-storage';
import { updateTreeNodeForTree } from '@io-platform/core-common';
import { SystemLanguage } from '@locales';
import { defineStore } from 'pinia';
import { reactive, toRef } from 'vue';

export const adminAccessStore = defineStore(
  PiniaName.AdminAccess,
  () => {
    /** 初始store的值 */
    const initialState = (): AdminAccessState => ({
      language: SystemLanguage.ZhCn,
      navigationType: MenuStatus.CompanyPerson,
      menuList: [],
      isMenuListInitialized: false,
      menuMap: new Map(),
      tabBarList: [],
    });

    /** 数据 */
    const state = reactive(initialState());

    const { formatUrl, findMenuByUrl, createTabByMenu } = useHelper();

    const getHomeRoutePath = () =>
      state.navigationType === MenuStatus.CompanyManagement
        ? '/homepage-company'
        : '/user-homepage';

    const actions = {
      /** 初始化菜单列表 */
      async initMenuList(navigationType: MenuStatus, options: { resetTabBar?: boolean } = {}) {
        const { resetTabBar = true } = options;

        // 1. 设置导航栏类型
        this.setNavigationType(navigationType);

        // 2. 初始化菜单列表
        const { data } = await queryMenuList({ navigationType: state.navigationType });
        const menuList =
          updateTreeNodeForTree({
            treeNode: data.trees as MenuTreeOptions[],
            updateNode: formatUrl,
          }) || [];
        this.setMenuList(menuList);
        state.isMenuListInitialized = true;

        // 3. 初始化固定首页标签
        if (resetTabBar) this.setTabBarList([]);
        this.initHomeTabBar();
        return menuList;
      },

      /** 确保菜单列表 */
      async ensureMenuList() {
        if (state.isMenuListInitialized) {
          this.initHomeTabBar();
          return state.menuList;
        }
        await this.initMenuList(state.navigationType, { resetTabBar: false });
        return state.menuList;
      },

      /** 设置导航栏类型 */
      setNavigationType(navigationType: MenuStatus) {
        state.navigationType = navigationType;
      },

      /** 设置侧边栏菜单 */
      setMenuList(menuList: MenuTreeOptions[]) {
        state.menuList = menuList;
        state.menuMap.clear();
        const walk = (list: MenuTreeOptions[]) => {
          list.forEach(item => {
            state.menuMap.set(item.fullUrl, item);
            if (item.children?.length) walk(item.children);
          });
        };
        walk(menuList);
      },
      /** 设置顶部导航栏 */
      setTabBarList(tabBarList: TabBarListOptions[]) {
        state.tabBarList = tabBarList;
      },
      /** 初始化固定首页标签 */
      initHomeTabBar() {
        const homeMenu = findMenuByUrl(state.menuList, getHomeRoutePath());
        if (!homeMenu) return;
        this.addTabBar(createTabByMenu(homeMenu));
      },
      /** 添加顶部导航栏 */
      addTabBar(tab: TabBarListOptions) {
        const index = state.tabBarList.findIndex(item => item.fullPath === tab.fullPath);
        if (index > -1) {
          if (tab.affix) {
            const [currentTab] = state.tabBarList.splice(index, 1);
            state.tabBarList.unshift({ ...currentTab, ...tab });
          }
          return;
        }
        if (tab.affix) {
          state.tabBarList.unshift(tab);
          return;
        }
        state.tabBarList.push(tab);
      },
      /** 移除顶部导航栏 */
      removeTabBar(fullPath: string) {
        state.tabBarList = state.tabBarList.filter(item => item.fullPath !== fullPath);
      },

      /** 获取菜单栏Map */
      getMenuMap() {
        if (state.menuList.length && state.menuMap.size === 0) {
          const walk = (list: MenuTreeOptions[]) => {
            list.forEach(item => {
              state.menuMap.set(item.fullUrl, item);
              if (item.children?.length) walk(item.children);
            });
          };
          walk(state.menuList);
        }
        return state.menuMap;
      },

      /** 获取菜单栏首页Url */
      getMenuHomeUrl() {
        const homeMenuOpt = findMenuByUrl(state.menuList, getHomeRoutePath());
        return homeMenuOpt?.fullUrl;
      },
    };

    return {
      state: toRef(state),
      ...actions,
    };
  },
  {
    persist: [
      {
        storage: sessionPersistStorage,
        pick: ['state.language', 'state.navigationType', 'state.menuList', 'state.tabBarList'],
      },
    ],
  }
);
