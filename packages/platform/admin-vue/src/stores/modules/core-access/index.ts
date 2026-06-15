import type { CoreAccessState } from '@admin-vue/stores/modules/core-access/index.type';

import { PiniaName } from '@admin-vue/stores/index.enum';
import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';

export const coreAccessStore = defineStore(
  PiniaName.CoreAccess,
  () => {
    /** 初始store的值 */
    const initialState = (): CoreAccessState => ({
      accessToken: null,
      accessTokenExpireTime: 0,
    });
    /** 数据 */
    const state = reactive(initialState());
    /** 方法 */
    const actions = {
      /** 更新token过期时间戳 */
      updateNowTime() {
        state.accessTokenExpireTime = Date.now() + 24 * 60 * 60 * 1000; // 24小时
      },

      /** 设置accessToken */
      setAccessToken(accessToken: string) {
        // 1. 更新当前时间戳
        this.updateNowTime();
        // 2. 存储accessToken
        state.accessToken = accessToken;
      },

      /** 获取accessToken */
      getAccessToken() {
        if (this.isTokenExpired()) {
          // 1. 删除accessToken
          state.accessToken = null;
          // 2. 删除过期时间
          state.accessTokenExpireTime = 0;
        }
        return state.accessToken;
      },

      /** 判断token是否过期 */
      isTokenExpired() {
        const now = Date.now();
        return now >= state.accessTokenExpireTime;
      },

      /** 删除accessToken */
      removeAccessToken() {
        state.accessToken = null;
        state.accessTokenExpireTime = 0;
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
      pick: ['accessToken', 'accessTokenExpireTime'],
    },
  }
);
