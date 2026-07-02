import type { Pinia } from 'pinia';
import type { App } from 'vue';

import { createPinia } from 'pinia';
import { createLocalPersistStorage } from './persist-storage';

let pinia: Pinia;

export interface InitStoreOptions {
  /**
   * @zh_CN 应用名,可在这里配置应用名,应用名将被用于持久化的前缀
   */
  namespace: string;
}

export const initStores = async (app: App, options: InitStoreOptions) => {
  const { createPersistedState } = await import('pinia-plugin-persistedstate');

  pinia = createPinia();
  const { namespace } = options;
  pinia.use(
    createPersistedState({
      // key $appName-$store.id
      key: storeKey => `${namespace}-${storeKey}`,
      storage: createLocalPersistStorage(namespace),
    })
  );
  app.use(pinia);
  return;
};
