import type { App } from 'vue';

import { initRouter } from '@admin-web/router';
import { initStores } from '@admin-web/stores';
import { envVariables } from '@admin-web/utils/env-var';

export const initApp = async (app: App) => {
  const { name, version, isDev } = envVariables;
  const env = isDev ? 'dev' : 'prod';
  const namespace = `${name}-${version}-${env}`;

  // 配置 路由
  await initRouter(app);

  // 配置 pinia-tore
  await initStores(app, { namespace });
  return app;
};
