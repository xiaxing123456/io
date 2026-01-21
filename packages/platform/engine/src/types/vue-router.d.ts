import { RouteMetaCustomizeOptions } from '@engine/router/index.types';
import 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        customizeOps?: RouteMetaCustomizeOptions;
    }
}
