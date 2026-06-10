import { RouteMetaCustomizeOptions } from '@admin-vue/router/index.types';
import 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        customizeOps?: RouteMetaCustomizeOptions;
    }
}
