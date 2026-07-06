import { MenuStatus } from '@admin-web/enums/global.enum';

/** 登录用户信息 */
export interface UserInfoVO {
  id: number;
  name: string;
  nickname: string;
  routeList: UserRouteConfigVO[];
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/** 用户路由信息 */
export interface UserRouteConfigVO {
  menuName: string;
  menuCode: string;
  parentCode: string;
  menuSvgId: string;
  menuSort: number;
  navigationType: MenuStatus;
  routeName: string;
}
