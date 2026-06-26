import { MenuStatus } from '@admin-vue/enums/global.enum';

/**
 * 系统资源核心模块
 */
export type SystemModuleAccessState = {
  /** 激活的导航栏项 */
  activeTabFullPath: string;
  navigationType: MenuStatus;
  /**
   * 顶部导航栏列表
   */
  tabBarList: TabBarListOptions[];
  /**
   * 侧边栏列表
   */
  menuList: MenuTreeOptions[];
  /** 缓存的视图名称 */
  cachedViewNames: string[];

  /** 路由 */
  routeRecordRaw: AnyObj[];
};

// /** 系统导航栏配置 */
// export type SystemNavigationOptions = {
//   /**
//    * 顶部导航栏列表
//    */
//   tabBarlist: TabBarListOptions[];
//   /**
//    * 侧边栏列表
//    */
//   menulist: MenuTreeOptions[];
//   /** 缓存的视图名称 */
//   cachedViewNames: string[];
// };

/** 顶部导航栏项 */
export type TabBarListOptions = {
  /** 展示标题 */
  title: string;
  /** 跳转地址，可以直接 router.push(path) */
  path: string;
  /** 完整路径，含 query，用于唯一匹配 */
  fullPath: string;
  /** 路由 name，用于 keep-alive 或权限判断 */
  routeName?: string;
  /** 菜单编码 */
  menuCode?: string;
  /** 导航类型 */
  navigationType?: MenuStatus;
  /** 图标 */
  icon?: string;
  /** 是否固定标签，例如首页 */
  affix?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否缓存 */
  keepAlive?: boolean;
  /** KeepAlive include 使用的组件名 */
  componentName?: string;
};

/** 侧边栏项 */
export interface MenuTreeOptions {
  id: number;
  parentId: number;
  url: string;
  menuName: string;
  menuCode: string;
  menuSort: number;
  menuSvgId: string;
  navigationType: MenuStatus;
  children: MenuTreeOptions[];
}
