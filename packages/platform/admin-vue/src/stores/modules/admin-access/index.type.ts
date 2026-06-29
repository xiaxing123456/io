import { MenuStatus } from '@admin-vue/enums/global.enum';
import { SystemLanguage } from '@locales';

/**
 * 系统资源核心模块
 */
export type AdminAccessState = {
  /** 语言 */
  language: SystemLanguage;
  /** 导航类型 */
  navigationType: MenuStatus;
  /** 侧边栏列表 */
  menuList: MenuTreeOptions[];
  /** 菜单是否已在本次应用生命周期初始化 */
  isMenuListInitialized: boolean;
  menuMap: Map<string, MenuTreeOptions>;
  /** 顶部导航列表 */
  tabBarList: TabBarListOptions[];
};

/** 侧边栏项 */
export interface MenuTreeOptions {
  id: number;
  parentId: number;
  url: string;
  fullUrl: string;
  menuName: string;
  menuCode: string;
  menuSort: number;
  menuSvgId: string;
  navigationType: MenuStatus;
  children: MenuTreeOptions[];
}

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
