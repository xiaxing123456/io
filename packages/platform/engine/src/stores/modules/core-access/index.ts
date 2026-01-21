import type { AccessToken, CoreAccessState } from '@engine/stores/modules/core-access/index.type';

import { PiniaName } from '@engine/stores/index.enum';
import { defineStore } from 'pinia';

export const coreAccessStore = defineStore(PiniaName.User, {
    state: (): CoreAccessState => ({
        accessToken: null,
    }),
    persist: {
        // 持久化
        pick: ['accessToken'],
    },
    actions: {
        setAccessToken(token: AccessToken) {
            this.accessToken = token;
        },
    },
});
