import type { LoginDto } from '@admin-web/apis/users/index.type';
import {
  ClearUserTabType,
  UserAccessState,
  UserMenuOpt,
  UserTabsOpt,
} from '@admin-web/stores/modules/user-access/index.type';

import { currentUserMenu } from '@admin-web/apis/sys-menu';
import { login } from '@admin-web/apis/users';
import { MenuStatus } from '@admin-web/enums/global.enum';
import { PiniaName } from '@admin-web/stores/index.enum';
import { updateTreeNodeForTree } from '@io-platform/core-common';
import { defineStore } from 'pinia';
import XEUtils from 'xe-utils';

export const userAccessStore = defineStore(PiniaName.UserAccess, {
  state: (): UserAccessState => {
    return {
      accessToken: null,
      timeStamp: 0,
      tokenTimeoutValue: 2 * 3600 * 1000, // 默认2小时
      userInfo: null,
      navigationType: MenuStatus.CompanyPerson,
      menuTreeList: [],
      activeUserTab: '',
      userTabs: [],
    };
  },
  getters: {
    /** 获取accessToken */
    getAccessToken: state => state.accessToken,
    /** 登录状态 */
    loginStatus(state) {
      return !!(state.accessToken && state.userInfo);
    },

    /** 菜单路由列表 */
    navigationMenuTreeList(state): UserMenuOpt[] {
      return state.menuTreeList.filter(item => item.navigationType === state.navigationType) || [];
    },
    /** 默认首页菜单 */
    defaultHomeMenu(): UserMenuOpt | null {
      const rest = this.navigationMenuTreeList[0];
      if (rest) return rest;
      return null;
    },
    /** 菜单名称映射 */
    menuNameMaps() {
      const codeMaps: Record<string, UserMenuOpt> = {};
      XEUtils.eachTree(this.menuTreeList, item => {
        codeMaps[item.name] = item;
      });
      return codeMaps;
    },
  },
  actions: {
    // ============= 用户服务控制 ============
    /** 初始化服务 */
    async initServer() {
      if (this.loginStatus) {
        // 更新用户菜单
        await this.updateUserMenu();
        return;
      }
      return Promise.resolve(false);
    },
    /** 登录服务 */
    async loginServer(params: LoginDto) {
      try {
        const { data } = await login(params);
        this.setToken({ accessToken: data.token });
        this.userInfo = data.userInfo;
        await this.updateUserMenu();
      } catch (error) {
        logger.log(error);
      }
    },
    // ============= token控制 ============
    /** 设置token 信息 */
    setToken(data: { accessToken: string }) {
      this.accessToken = data.accessToken;
      this.timeStamp = Date.now();
    },
    /** 校验是否登录超时 */
    isCheckTimeout() {
      // 当前时间戳
      const currentTime = Date.now();
      return currentTime - this.timeStamp > this.tokenTimeoutValue;
    },
    /** 清除token信息 */
    clearToken() {
      this.accessToken = null;
    },

    // ============= 菜单控制 =================
    /** 更新用户菜单 */
    async updateUserMenu() {
      try {
        const { data } = await currentUserMenu();

        this.menuTreeList = updateTreeNodeForTree({
          treeNode: data as UserMenuOpt[],
          updateNode: node => {
            node.title = node.menuName;
            node.name = node.menuCode;
            node.icon = '';
            if (node.path !== '/') {
              node.routerLink = { name: node.menuCode };
            }
            return node;
          },
        });
      } catch (error) {
        logger.log(error);
      }
    },
    /** 切换菜单模式 */
    async changeNavigationType() {
      this.navigationType =
        this.navigationType === MenuStatus.CompanyPerson
          ? MenuStatus.CompanyManagement
          : MenuStatus.CompanyPerson;
    },

    // ================== 页签控制 ===================
    /** 添加用户页签 */
    addUserTab(tab: UserTabsOpt): void {
      if (!this.userTabs.some(item => item.name === tab.name)) {
        this.userTabs.push(tab);
      }
      this.activeUserTab = tab.name;
    },

    /** 关闭用户页签 如果关闭的是当前激活页签则返回新激活页签 否则返回null */
    removeUserTab(tab: { name: string }): UserTabsOpt | null {
      const index = this.userTabs.findIndex(item => item.name === tab.name);
      if (index > -1) {
        if (tab.name === this.activeUserTab) {
          const nextItem = this.userTabs[index + 1] || this.userTabs[index - 1];
          if (nextItem) {
            this.activeUserTab = nextItem.name;
            this.userTabs.splice(index, 1);
            return nextItem;
          }
        }
        this.userTabs.splice(index, 1);
      }
      return null;
    },
    /** 清除用户页签 */
    clearUserTab(type: ClearUserTabType) {
      const index = this.userTabs.findIndex(item => item.name === this.activeUserTab);
      switch (type) {
        case ClearUserTabType.CloseOther:
          this.userTabs = this.userTabs.filter(item => item.name === this.activeUserTab);
          break;
        case ClearUserTabType.CloseLeft:
          this.userTabs = this.userTabs.slice(index);
          break;
        case ClearUserTabType.CloseRight:
          this.userTabs = this.userTabs.slice(0, index + 1);
          break;
        case ClearUserTabType.CloseAll:
          this.activeUserTab = '';
          this.userTabs = [];
          break;
      }
    },

    /** 清除信息 */
    clearInfo() {
      this.clearToken();
      this.userInfo = null;
    },
  },
  persist: {
    pick: ['accessToken', 'timeStamp', 'userInfo', 'menuTreeList'],
  },
});
