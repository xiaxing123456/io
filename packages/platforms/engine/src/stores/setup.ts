import type { Pinia } from 'pinia';
import type { App } from 'vue';

import { createPinia } from 'pinia';
import SecureLS from 'secure-ls';

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
    const ls = new SecureLS({
        encodingType: 'aes',
        encryptionSecret: import.meta.env.VITE_APP_STORE_SECURE_KEY,
        isCompression: true,
        // @ts-ignore secure-ls does not have a type definition for this
        metaKey: `${namespace}-secure-meta`,
    });
    pinia.use(
        createPersistedState({
            // key $appName-$store.id
            key: storeKey => `${namespace}-${storeKey}`,
            storage: import.meta.env.DEV
                ? localStorage
                : {
                      getItem(key) {
                          return ls.get(key);
                      },
                      setItem(key, value) {
                          ls.set(key, value);
                      },
                  },
        })
    );
    app.use(pinia);
    return;
};
