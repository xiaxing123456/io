import type {
  MenuTreeOptions,
  SystemModuleAccessState,
  TabBarListOptions,
} from '@admin-vue/stores/modules/system-module-access/index.type';

import { MenuStatus } from '@admin-vue/enums/global.enum';
import { PiniaName } from '@admin-vue/stores/index.enum';
import { sessionPersistStorage } from '@admin-vue/stores/persist-storage';
import { defineStore } from 'pinia';
import { reactive, toRef } from 'vue';
import { RouteRecordRaw } from 'vue-router';

export const systemModuleAccessStore = defineStore(
  PiniaName.SystemModuleAccess,
  () => {
    /** 初始store的值 */
    const initialState = (): SystemModuleAccessState => ({
      activeTabFullPath: '',
      navigationType: MenuStatus.CompanyPerson,
      menuList: [],
      tabBarList: [],
      cachedViewNames: [],

      routeRecordRaw: [],
    });

    /** 数据 */
    const state = reactive(initialState());

    /** 方法 */
    const actions = {
      /** 设置导航栏类型 */
      setNavigationType(navigationType: MenuStatus) {
        state.navigationType = navigationType;
      },
      setMenuList(menuList: MenuTreeOptions[]) {
        state.menuList = menuList;
      },
      setTabBarList(tabBarList: TabBarListOptions[]) {
        state.tabBarList = tabBarList;
      },
      setActiveTab(activeTabFullPath: string) {
        state.activeTabFullPath = activeTabFullPath;
      },

      /** 设置路由记录 */
      setRouteRecordRaw(routes: RouteRecordRaw[]) {
        state.routeRecordRaw = routes;
      },

      /** 获取路由 */
      getRouteRecordRaw() {
        return state.routeRecordRaw;
      },

      /** 获取首页路由 */
    };

    return {
      state: toRef(state),
      ...actions,
    };
  },
  {
    // 持久化
    persist: [
      {
        storage: sessionPersistStorage,
        pick: [
          'state.activeTabFullPath',
          'state.tabBarList',
          'state.menuList',
          'state.cachedViewNames',
          'state.navigationType',
        ],
      },
    ],
  }
);
