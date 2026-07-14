import type { UserMenuVo } from '@admin-web/apis/sys-menu/index.type';
import type { SysUserInfo } from '@admin-web/apis/users/index.type';
import type { MenuStatus } from '@admin-web/enums/global.enum';

export type AccessToken = null | string;

export interface UserMenuOpt extends UserMenuVo {
  /** 菜单显示标题 */
  title: string;
  /** 菜单唯一名称 */
  name: string;
  /** 菜单图标 */
  icon: string;
  /** 对应vue-router路由配置 */
  routerLink: any;
}

/**
 * 用户模块
 */
export interface UserAccessState {
  /**
   * 登录 accessToken
   */
  accessToken: AccessToken;
  /** 登录时间 */
  timeStamp: number;
  /** 超时时长 */
  tokenTimeoutValue: number;
  /** 用户信息 */
  userInfo: SysUserInfo | null;
  /** 导航类型 */
  navigationType: MenuStatus;
  /** 菜单列表 */
  menuTreeList: UserMenuOpt[];
}
