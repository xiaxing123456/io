import type { App } from 'vue';
import type { Router, RouteRecordRaw } from 'vue-router';

import { routers } from '@admin-web/router/modules';
import { generateRouter, mergeRoute } from '@admin-web/router/tools';

let router: Router;
/** 初始化路由 */
export const initRouter = (
  app: App,
  options?: {
    exRoutes?: RouteRecordRaw[];
    callbackFn?: ({ router }: { router: Router }) => void;
  }
) => {
  const installRoutes = (options?.exRoutes && mergeRoute(routers, options.exRoutes)) || routers;

  router = generateRouter(installRoutes, {});

  app.use(router);
  return app;
};
