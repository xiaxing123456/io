import type { UseRouteGuardOptions } from '@engine/router/index.types';
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

import { useRouteGuard } from '@engine/router/tools/guard';
import { routersStore } from '@engine/stores/modules/routers';

/**
 * ### 相同name的路由进行路由信息替换
 * @param routes
 * @param targetRoute
 */
const replaceComponent = (routes: RouteRecordRaw[], targetRoute: RouteRecordRaw) => {
    routes.forEach((item: RouteRecordRaw) => {
        const { name, component } = targetRoute;
        if (item.name === name) {
            item.component = component;
            item.meta = targetRoute.meta ? targetRoute.meta : {};
            if ('children' in targetRoute) {
                item.children = targetRoute.children;
            }
            targetRoute.meta = { ...targetRoute.meta, ...{ cover: true } };
        }
        if ('children' in item) {
            replaceComponent(item.children as RouteRecordRaw[], targetRoute);
        }
    });
};

/**
 * 创建合并层级关系
 * @param routes
 * @param targetRoute
 */
const constructLevel = (routes: RouteRecordRaw[], targetRoute: RouteRecordRaw) => {
    routes.forEach((item: RouteRecordRaw) => {
        const { name } = item;
        if (targetRoute.meta?.parent === name) {
            if ('children' in item) {
                item.children?.push(targetRoute);
            } else {
                item.children = [targetRoute];
            }
        } else if ('children' in item) {
            constructLevel(item.children as RouteRecordRaw[], targetRoute);
        }
    });
};

/**
 * 合并路由
 * @param defaultRoutes
 * @param customRoutes
 * @returns
 */
const mergeRoute = (defaultRoutes: RouteRecordRaw[], customRoutes: RouteRecordRaw[]) => {
    // 遍历自定义路由, 匹配相同name的路由进行替换
    customRoutes.forEach((item: RouteRecordRaw) => {
        replaceComponent(defaultRoutes, item);
    });

    // 删除被覆盖的路由
    let index = customRoutes.length;
    while (index--) {
        if (customRoutes[index].meta?.cover) {
            customRoutes.splice(index, 1);
        }
    }

    // 添加层级关系
    customRoutes.forEach((item: RouteRecordRaw) => {
        if (item.meta?.parent && item.meta?.parent !== '') {
            constructLevel(defaultRoutes, item);
        } else {
            defaultRoutes.push(item);
        }
    });

    // 返回
    return [...defaultRoutes];
};

/**
 * 初始化路由
 * @param routes
 * @returns
 */
const initRouter = (routes: RouteRecordRaw[]) => {
    const router = createRouter({
        history: createWebHashHistory(import.meta.env.BASE_URL),
        routes,
    });
    return router;
};

const generateRouter = (routes: RouteRecordRaw[], options: UseRouteGuardOptions) => {
    const useRoutersStore = routersStore();
    useRoutersStore.setRouteRecordRaw(routes);
    return useRouteGuard(initRouter(routes), options);
};

export { generateRouter, mergeRoute };
