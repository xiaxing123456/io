import type { UseRouteGuardOptions } from '@admin-web/router/index.type';
import type { NavigationGuardWithThis, Router } from 'vue-router';

import { isIgnoreLoginPath } from '@admin-web/router/tools/common';
import { userAccessStore } from '@admin-web/stores/modules/user-access';

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
  // 默认前置守卫
  const $_beforeEachFn: NavigationGuardWithThis<undefined> = async (to, from, next) => {
    const toRouteName = (to.name ?? '') as string;
    const toRoutePath = to.path;

    const userAccess = userAccessStore();

    // 支持不登录就可以访问地址
    if (isIgnoreLoginPath(to)) {
      next();
      return;
    }

    // 判断是否登录状态
    if (userAccess.getAccessToken) {
    }
  };

  // 注册路由前置守卫
  router?.beforeEach(options?.beforeEachFn || $_beforeEachFn);
  return router;
};
