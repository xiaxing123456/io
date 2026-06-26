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
      tabBarList: [],
    });

    /** 数据 */
    const state = reactive(initialState());

    const { formatUrl, findMenuByUrl } = useHelper();

    const actions = {
      /** 初始化菜单列表 */
      async initMenuList(navigationType: MenuStatus) {
        try {
          this.setNavigationType(navigationType);
          const { data } = await queryMenuList({ navigationType: state.navigationType });
          const menuList =
            updateTreeNodeForTree({
              treeNode: data.trees,
              updateNode: formatUrl,
            }) || [];
          this.setMenuList(menuList);
        } catch (e) {
          logger.log(e);
        }
      },
      /** 设置导航栏类型 */
      setNavigationType(navigationType: MenuStatus) {
        state.navigationType = navigationType;
      },
      /** 设置侧边栏菜单 */
      setMenuList(menuList: MenuTreeOptions[]) {
        state.menuList = menuList;
      },
      /** 设置顶部导航栏 */
      setTabBarList(tabBarList: TabBarListOptions[]) {
        state.tabBarList = tabBarList;
      },
      /** 获取菜单栏首页Url */
      getMenuHomeUrl() {
        const url =
          state.navigationType === MenuStatus.CompanyPerson
            ? '/homepage-company'
            : '/homepage-person';
        const homeMenuOpt = findMenuByUrl(state.menuList, url);
        return homeMenuOpt?.fullUrl || '/';
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
        pick: ['state.language', 'state.navigationType', 'state.menuList'],
      },
    ],
  }
);
