import { UserInfoVO } from '@admin-web/apis/users/index.type';
import { MenuStatus } from '@admin-web/enums/global.enum';

export type AccessToken = null | string;

// export interface UserInfoType {
//   /** 用户id */
//   id: number;
//   /** 账户名 */
//   userName: string;
//   /** 昵称 */
//   name: string;
//   /** 手机号 */
//   phone: string;
//   /** 头像 */
//   avatar: string;
//   /** 描述 */
//   description: string;
//   /** 状态 */
//   status: number;
//   /** 是否删除 */
//   isDeleted: number;
//   /** 创建时间 */
//   createTime: string;
//   /** 更新时间 */
//   updateTime: string;
// }

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
  /** 用户信息 */
  userInfo: UserInfoVO | null;
  /** 导航类型 */
  navigationType: MenuStatus;
}
