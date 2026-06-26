import type { UseRouteGuardOptions } from '@admin-vue/router/index.type';

import { useTabBarRouteSync } from '@admin-vue/composables/use-tab-bar-route-sync/use-tab-bar-route-sync';
import { isIgnoreLoginPath } from '@admin-vue/router/tools/common';
import { coreAccessStore } from '@admin-vue/stores';
import { NavigationGuardWithThis, NavigationHookAfter, Router } from 'vue-router';

/**
 * ## 用来生成路由守卫的hooks，支持自定义钩子(vue-router)
 * @param router 路由实例
 * @param options
 * @param options.beforeEachFn - 自定义路由前置守卫
 * @param options.afterEach - 自定义路由后置钩子
 * @param options.beforeResolve - 自定义路由解析钩子
 * @param options.beforeEachFnHook - 路由前置守卫里面的钩子
 * @param options.afterEachHook - 路由后置钩子里面的钩子
 * @returns
 */
export const useRouteGuard = (router: Router, options?: UseRouteGuardOptions): Router => {
  const coreAccess = coreAccessStore();
  const { syncRouteToTab } = useTabBarRouteSync();

  // 默认前置守卫
  const $_beforeEachFn: NavigationGuardWithThis<undefined> = async (to, from, next) => {
    // * 前置守卫的钩子, 后面可能还会增加钩子, 用于拓展导航守卫
    if (options?.beforeEachFnHook) {
      const { isDone } = await options?.beforeEachFnHook({ router, to, from, next });
      if (isDone) return;
    }

    const toRouteName = (to.name ?? '') as string;
    const toRoutePath = to.path;
    const accessToken = coreAccess.getAccessToken();
    // 支持不登录就可以访问地址
    if (isIgnoreLoginPath(to)) {
      next();
      return;
    }

    // 如果跳转的是根路径，并且已登录，则跳转到首页
    if (toRoutePath === '/' && accessToken) {
      next({});
    }

    // 如果是登录页面，并且已登录，则跳转到来的路径
    if (toRouteName === 'login' && accessToken) {
      if (from.name) {
        next(false);
      } else {
        next({
          path: from.fullPath,
        });
      }
      return;
    }

    // logout
    if (!['login', 'passwordUpdate'].includes(toRouteName) && !accessToken) {
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

  const $_afterEach: NavigationHookAfter = async (to, from) => {
    if (options?.afterEachHook) {
      const { isDone } = await options?.afterEachHook({ router, to, from });
      if (isDone) return;
    }
    console.log('$_afterEach', to);
    // syncRouteToTab(to);
  };
  // 注册路由前置守卫
  router?.afterEach(options?.afterEach || $_afterEach);

  return router;
};
