import { NavigationGuardWithThis, NavigationHookAfter } from 'vue-router';

/** # 路由的 meta自定义配置项 */
export interface RouteMetaCustomizeOptions extends Record<string, any> {
  /** ## 是否是忽略登录的路由 */
  isIgnoreLogin?: boolean;
}

export interface UseRouteGuardOptions {
  /** 自定义路由前置守卫 */
  beforeEachFn?: NavigationGuardWithThis<undefined>;
  /** 自定义路由后置钩子 */
  afterEach?: NavigationHookAfter;
  /** 自定义路由解析钩子 */
  beforeResolve?: NavigationGuardWithThis<undefined>;
  /** 路由前置守卫里面的钩子 */
  beforeEachFnHook?: (data: AnyObj) => Promise<{ isDone: boolean }>;
  /** 路由后置钩子里面的钩子 */
  afterEachHook?: (data: AnyObj) => Promise<{ isDone: boolean }>;
}
