import type { UseRouteGuardOptions } from '@engine/router/index.types';
import type { NavigationGuardWithThis, Router } from 'vue-router';

import {
    isIgnoreHistoryPath,
    isIgnoreLoginPath,
    isUrlDialogPath,
} from '@engine/router/tools/us-options';
import { coreAccessStore } from '@engine/stores/modules/core-access';

/**
 * ## 用来生成路由守卫的hooks，支持自定义钩子(vue-router)
 * @param router 路由实例
 * @param options
 * @param options.beforeEachFn - 自定义路由前置守卫
 * @param options.afterEach - 自定义路由后置钩子
 * @param options.beforeResolve - 自定义路由解析钩子
 * @param options.beforeEachFnHook - 路由前置守卫里面的钩子
 * @returns
 */
export const useRouteGuard = (router: Router, options?: UseRouteGuardOptions): Router => {
    const coreAccess = coreAccessStore();
    // 默认前置守卫
    const $_beforeEachFn: NavigationGuardWithThis<undefined> = async (to, from, next) => {
        // * 前置守卫的钩子, 后面可能还会增加钩子, 用于拓展导航守卫
        if (options?.beforeEachFnHook) {
            const { isDone } = await options?.beforeEachFnHook({ router, to, from, next });
            if (isDone) return;
        }

        // 支持不登录就可以访问地址
        if (isIgnoreLoginPath(to)) {
            next();
            return;
        }

        const toRouteName = (to.name ?? '') as string;

        // 如果是登录页面，并且已登录，则跳转到首页
        if (toRouteName === 'login' && coreAccess.accessToken) {
            if (from.name) {
                next(false);
            } else {
                next({
                    path: from.fullPath,
                });
            }
            return;
        }

        // 如果未登录设置全局的跳转地址用于登录直接跳转
        if (
            !isIgnoreHistoryPath(to) &&
            !isUrlDialogPath(to) &&
            !coreAccess.accessToken &&
            to.path !== '/'
        ) {
            // 如果存储的还是 已登录 状态，就将登录状态改成 退出登录
        }

        // logout
        if (!['login', 'passwordUpdate'].includes(toRouteName) && !coreAccess.accessToken) {
            // // 处理单点登录重定向
            // try {
            //     await handleRedirectInfo();
            //     // 必须调用next 不然会导致改变Window.location.href 页面不跳转
            //     // 只能写 next({ name: 'login' }); 不然页面会刷新 导致登录超时 出现二次确认框
            // } catch (error) {
            //     logger.error(error, 'error');
            // } finally {
            //     next({ name: 'login' });
            // }

            next({ name: 'login' });
            return;
        }

        next();
    };

    // 注册路由前置守卫
    router?.beforeEach(options?.beforeEachFn || $_beforeEachFn);

    return router;
};
