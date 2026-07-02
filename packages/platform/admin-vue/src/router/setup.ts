import type { App } from 'vue';

import { routers } from '@admin-vue/router/modules';
import { generateRouter, mergeRoute } from '@admin-vue/router/tools';
import { Router, RouteRecordRaw } from 'vue-router';

export let router: Router;

export const initRouter = (
  app: App,
  options?: {
    exRoutes?: RouteRecordRaw[];
    callbackFn?: ({ router }: { router: Router }) => void;
  }
) => {
  const installRoutes = (options?.exRoutes && mergeRoute(routers, options.exRoutes)) || routers;

  router = generateRouter(installRoutes, {});

  try {
    options?.callbackFn && options?.callbackFn({ router });
  } catch (error) {
    logger.error(error);
  }
  app.use(router);
  return app;
};
