/**
 * # 路由的类型
 * - 在路由 meta.customizeOps.routeType 中为路由进行了类型区分, 用来实现特定业务
 * - Normal: 普通类型路由
 * - UrlDialog: 以新标签页形式打开的路由 (可以能和 demo 类型共存)
 * - demo: 示例路由 (可能和 UrlDialog 类型共存)
 */
export enum RouteMetaType {
    /** 普通类型路由 */
    Normal = 1,
    /** 以新标签页形式打开的路由 */
    UrlDialog = 2,
    /** demo 示例路由 */
    Demo = 3,
}

/** 路由 meta 字段中自定义参数的 key */
export enum RouteMetaCustomizeOpsKey {
    Name = 'customizeOps',
}
