import type { ILoginForm } from '@admin-vue/apis/login';
import type {
  UserAccessState,
  UserInfoType,
} from '@admin-vue/stores/modules/user-access/index.type';

import { login } from '@admin-vue/apis/login';
import { MenuStatus } from '@admin-vue/enums/global.enum';
import { router } from '@admin-vue/router';
import { adminAccessStore } from '@admin-vue/stores';
import { PiniaName } from '@admin-vue/stores/index.enum';
import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';

export const userAccessStore = defineStore(
  PiniaName.UserAccess,
  () => {
    /** 初始store的值 */
    const initialState = (): UserAccessState => ({
      accessToken: null,
      timeStamp: 0,
      userInfo: null,
    });

    /** 数据 */
    const state = reactive(initialState());

    /** 方法 */
    const actions = {
      /** 设置token */
      setAccessToken(accessToken: string | null) {
        state.accessToken = accessToken;
        state.timeStamp = accessToken ? Date.now() : 0;
      },
      /** 设置用户信息 */
      setUserInfo(userInfo: UserInfoType | null) {
        state.userInfo = userInfo;
      },

      /**
       * 用户登录，这个登录接口包含着登录用户的信息以及登录token
       */
      async login(loginForm: ILoginForm) {
        try {
          // 1. 登录
          const { data } = await login(loginForm);
          if (!data) return;

          // 2. 设置信息
          this.setAccessToken(data.token);
          this.setUserInfo(data.user);

          // 3. 初始化化菜单信息
          const adminAccess = adminAccessStore();
          adminAccess.initMenuList(MenuStatus.CompanyPerson);

          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      },

      /** 登出 */
      logout() {
        // 清空用户信息
        this.setAccessToken(null);
        this.setUserInfo(null);

        // 重置标签页
        const adminAccess = adminAccessStore();
        adminAccess.setTabBarList([]);
        adminAccess.setMenuList([]);

        // 跳转到登录页
        router.push('/login');
      },
    };

    return {
      ...toRefs(state),
      ...actions,
    };
  },
  {
    // 持久化
    persist: {
      pick: ['userInfo'],
    },
  }
);
