import type { AppAccessState } from '@admin-web/stores/modules/app-access/index.type';

import { PiniaName } from '@admin-web/stores/index.enum';
import { defineStore } from 'pinia';

export const appAccessStore = defineStore(PiniaName.AppAccess, {
  state: (): AppAccessState => {
    return {
      pageKey: 0,
    };
  },
  getters: {},
  actions: {},
});
