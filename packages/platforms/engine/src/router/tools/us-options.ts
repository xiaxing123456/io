import { RouteMetaCustomizeOpsKey, RouteMetaType } from '@engine/router/index.enum';
import { RouteLocationNormalizedLoaded } from 'vue-router';

/**
 * # 是否是忽略登录的路由
 * @param route vue-route 当前 useRoute实例
 * @returns
 */
export const isIgnoreLoginPath = (route: RouteLocationNormalizedLoaded) => {
    const isIgnoreLogin = route.meta?.[RouteMetaCustomizeOpsKey.Name]?.isIgnoreLogin;
    return !!isIgnoreLogin;
};

/**
 * ## 是否是忽略登录后需要回到之前未登录时，粘贴在地址栏的路由
 * - 系统需求：在未登录的时候粘系统路由，登录后需要再次回到粘贴的页面
 * - 该配置是忽略记录某些路由
 * @param route vue-route 当前 useRoute实例
 * @returns
 */
export const isIgnoreHistoryPath = (route: RouteLocationNormalizedLoaded) => {
    const isIgnoreHistory = route.meta?.[RouteMetaCustomizeOpsKey.Name]?.isIgnoreHistory;
    return !!isIgnoreHistory;
};

/**
 * # 判断当前路由是否是一个浏览器 url 新标签页弹出层
 * - 示例
 *  ```typescript
 * import { isUrlDialogPath } from '@engine/utils/method/router';
 * import { useRoute } from 'vue-router';
 * const route = useRoute()
 * isUrlDialogPath(route)
 * ```
 * @param route vue-route 当前 useRoute实例
 * @returns
 */
export const isUrlDialogPath = (route: RouteLocationNormalizedLoaded) => {
    const routeType = route.meta?.[RouteMetaCustomizeOpsKey.Name]?.routeType;
    if (typeof routeType === 'number') {
        return routeType === RouteMetaType.UrlDialog;
    }
    if (Array.isArray(routeType)) {
        return routeType.includes(RouteMetaType.UrlDialog);
    }
    return false;
};
