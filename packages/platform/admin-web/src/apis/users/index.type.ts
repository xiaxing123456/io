import { MenuStatus } from '@admin-web/enums/global.enum';

/** 登录用户信息 */
export interface UserInfoVO {
  /** 用户id */
  id: number;
  /** 账号名称 */
  accountName: string;
  /** 昵称 */
  nickname: string;
  /** 手机号码 */
  phone: string;
  /** 头像 */
  avatar: string;
  /** 描述 */
  description: string;
  /** 用户路由信息 */
  routeList: UserRouteConfigVO[];
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/** 用户路由信息 */
export interface UserRouteConfigVO {
  id: number;
  parentId: number;
  menuCode: string;
  menuName: string;
  path: string;
  navigationType: MenuStatus;
  menuSort: number;
  menuSvgId: string;
}
