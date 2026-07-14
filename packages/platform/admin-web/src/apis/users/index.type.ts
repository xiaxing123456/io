import { MenuStatus } from '@admin-web/enums/global.enum';

/** 用户登录请求参数 */
export interface LoginDto {
  /** 账号名称 */
  accountName: string;
  /** 密码 */
  password: string;
  /** 验证码 */
  captcha: string;
  /** 验证码key */
  codeKey: string;
}

/** 登录返回信息 */
export interface LoginVo {
  token: string;
  tokenType: string;
  expiresIn: number;
  userInfo: SysUserInfo;
}

/** 登录用户信息 */
export interface SysUserInfo {
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
