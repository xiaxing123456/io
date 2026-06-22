import type { NavigationGuardWithThis, NavigationHookAfter } from 'vue-router';

/** # 路由的 meta自定义配置项 */
export interface RouteMetaCustomizeOptions extends Record<string, any> {
  /** ## 是否是忽略登录的路由 */
  isIgnoreLogin?: boolean;
  /**
   * ## 是否忽略登录后需要回到之前未登录时，粘贴在地址栏的路由
   * - 系统需求：在未登录的时候粘系统路由，登录后需要再次回到粘贴的页面
   * - 该配置是忽略记录某些路由
   */
  isIgnoreHistory?: boolean;
  /** 不进入 tabs-bar，例如登录页 */
  hiddenTab?: boolean;
  /** 固定标签，例如首页 */
  affix?: boolean;
  /** 是否缓存页面 */
  keepAlive?: boolean;
  /** 自定义 tab 标题，不配置则使用 route.meta.title */
  tabTitle?: string;
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
