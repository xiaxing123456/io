import type { ILoginForm } from '@admin-vue/apis/login';
import type {
  UserAccessState,
  UserInfoType,
} from '@admin-vue/stores/modules/user-access/index.type';

import { login } from '@admin-vue/apis/login';
import { coreAccessStore } from '@admin-vue/stores';
import { PiniaName } from '@admin-vue/stores/index.enum';
import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';

export const userAccessStore = defineStore(
  PiniaName.UserAccess,
  () => {
    /** 初始store的值 */
    const initialState = (): UserAccessState => ({
      userInfo: {
        id: -1,
        userName: '',
        name: '',
        phone: '',
        avatar: '',
        description: '',
        status: 0,
        isDeleted: 0,
        createTime: '',
        updateTime: '',
      },
    });

    /** 数据 */
    const state = reactive(initialState());

    /** 方法 */
    const actions = {
      /**
       * 更新用户信息
       * @param userInfo
       */
      updateUserInfo(userInfo: Partial<UserInfoType>) {
        Object.keys(userInfo).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(state.userInfo, key)) return;

          const value = userInfo[key as keyof UserInfoType];
          if (value !== undefined) Reflect.set(state.userInfo, key, value);
        });
      },

      /**
       * 用户登录，这个登录接口包含着登录用户的信息以及登录token
       */
      async login(loginForm: ILoginForm) {
        try {
          const { data } = await login(loginForm);
          if (!data) return;

          // 1. 储存token
          const coreAccess = coreAccessStore();
          coreAccess.setAccessToken(data.token);

          // 2. 储存用户信息
          this.updateUserInfo(data.user);

          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
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
