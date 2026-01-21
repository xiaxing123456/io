import type { App } from 'vue';
import type { Router, RouteRecordRaw } from 'vue-router';

import { routers } from '@engine/router/modules';
import { generateRouter, mergeRoute } from '@engine/router/tools';

export default {
    install(
        app: App,
        options?: {
            exRoutes?: RouteRecordRaw[];
            callbackFn?: ({ router }: { router: Router }) => void;
        }
    ) {
        const installRoutes =
            (options?.exRoutes && mergeRoute(routers, options.exRoutes)) || routers;

        const router = generateRouter(installRoutes, {});

        try {
            options?.callbackFn && options?.callbackFn({ router });
        } catch (error) {
            logger.error(error);
        }
        app.use(router);
        return app;
    },
};
