import type { UseRouteGuardOptions } from '@admin-web/router/index.type';
import type {
  NavigationGuardNext,
  NavigationGuardWithThis,
  NavigationHookAfter,
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
  Router,
} from 'vue-router';

import { LOGIN_PAGE_NAME } from '@admin-web/router/modules/config';
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
  /**
   * # 路由权限处理
   * @param to
   * @param from
   * @param next
   */
  const handleRoutePermission = (
    to: RouteLocationNormalizedGeneric,
    _from: RouteLocationNormalizedLoadedGeneric,
    next: NavigationGuardNext
  ) => {
    const userStore = userAccessStore();

    // 如果是默认首页
    if (to.path === '/') {
      const defaultHomeMenu = userStore.defaultHomeMenu;
      if (defaultHomeMenu) {
        next({
          ...defaultHomeMenu.routerLink,
          replace: true,
        });
        return;
      }
      next({
        name: 'PageError403',
      });
      return;
    }
    next();
  };

  // 默认前置守卫
  const $_beforeEachFn: NavigationGuardWithThis<undefined> = async (to, from, next) => {
    const toRouteName = (to.name ?? '') as string;
    const toRoutePath = to.path;

    console.log('$_beforeEachFn', toRouteName, toRoutePath);
    const userAccess = userAccessStore();
    // 支持不登录就可以访问地址
    if (isIgnoreLoginPath(to)) {
      next();
      return;
    }

    // 判断是否登录状态
    if (userAccess.loginStatus && to.name === LOGIN_PAGE_NAME) {
      next('/');
      return;
    } else if (userAccess.loginStatus) {
      handleRoutePermission(to, from, next);
      return;
    } else if (!userAccess.loginStatus && to.name !== LOGIN_PAGE_NAME) {
      next({
        name: LOGIN_PAGE_NAME,
      });
    }
    next();

    // // 登录状态检测
    // try {
    //   await userAccess.initServer();
    //   handleRoutePermission(to, from, next);
    // } catch (e) {
    //   next({
    //     name: LOGIN_PAGE_NAME,
    //   });
    // }
  };

  // 注册路由前置守卫
  router?.beforeEach(options?.beforeEachFn || $_beforeEachFn);

  // 默认后置钩子
  const $_afterEach: NavigationHookAfter = to => {
    const userAccess = userAccessStore();
    // 更新页签
    if (userAccess.loginStatus) {
      userAccess.addUserTab({
        name: to.name as string,
        routeName: to.name as string,
        path: to.fullPath,
        query: to.query,
        params: to.params,
      });
    }
  };
  router?.afterEach(options?.afterEach || $_afterEach);
  return router;
};
