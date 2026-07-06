import type { InitStoreOptions } from '@admin-web/stores/index.type';
import type { Pinia } from 'pinia';
import type { App } from 'vue';

import { createLocalPersistStorage } from '@admin-web/stores/persist-storage';
import { createPinia } from 'pinia';

let pinia: Pinia;

export const initStores = async (app: App, options: InitStoreOptions) => {
  const { createPersistedState } = await import('pinia-plugin-persistedstate');

  pinia = createPinia();
  const { namespace } = options;
  pinia.use(
    createPersistedState({
      key: storeKey => `${namespace}-${storeKey}`,
      storage: createLocalPersistStorage(namespace),
    })
  );
  app.use(pinia);
  return;
};
