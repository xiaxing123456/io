import SecureLS from 'secure-ls';

const createSecureStorage = (namespace: string) => {
  const ls = new SecureLS({
    encodingType: 'aes',
    encryptionSecret: import.meta.env.VITE_STORE_SECURE_KEY,
    isCompression: true,
    // @ts-ignore secure-ls does not have a type definition for this
    metaKey: `${namespace}-secure-meta`,
  });

  return {
    getItem(key: string) {
      return ls.get(key);
    },
    setItem(key: string, value: string) {
      ls.set(key, value);
    },
    removeItem(key: string) {
      ls.remove(key);
    },
  };
};

export const createLocalPersistStorage = (namespace: string) => {
  return import.meta.env.DEV ? localStorage : createSecureStorage(namespace);
};

export const sessionPersistStorage = {
  getItem(key: string) {
    return sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    sessionStorage.setItem(key, value);
  },
  removeItem(key: string) {
    sessionStorage.removeItem(key);
  },
};
