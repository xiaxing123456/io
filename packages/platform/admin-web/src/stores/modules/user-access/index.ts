import type { UserAccessState } from '@admin-web/stores/modules/user-access/index.type';

import { PiniaName } from '@admin-web/stores/index.enum';
import { defineStore } from 'pinia';
import XEUtils from 'xe-utils';

export const userAccessStore = defineStore(PiniaName.UserAccess, {
  state: (): UserAccessState => {
    return {
      accessToken: null,
      timeStamp: 0,
      userInfo: null,
    };
  },
  getters: {
    /** 获取accessToken */
    getAccessToken: state => state.accessToken,
    /** 登录状态 */
    loginStatus(state) {
      return !!(state.accessToken && state.userInfo);
    },
    /** 路由树列表 */
    routeTreeList(state) {
      const { userInfo } = state;
      if (!userInfo || !userInfo.routeList) return [];
      const routeList = userInfo.routeList.map(item => {
        const routeName = item.routeName;
        const obj = {
          title: item.menuName,
          code: item.menuCode,
          parentCode: item.parentCode,
          svg: item.menuSvgId,
          name: routeName,
        };
        return obj;
      });

      const rTreeList = XEUtils.toArrayTree(routeList, {
        key: 'code',
        parentKey: 'parentCode',
        children: 'childList',
      });
      return rTreeList;
    },
  },
  actions: {},
});
