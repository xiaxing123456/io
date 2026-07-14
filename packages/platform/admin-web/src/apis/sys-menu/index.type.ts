import type { MenuStatus } from '@admin-web/enums/global.enum';

export interface UserMenuVo {
  id: number;
  parentId: number;
  menuChode: string;
  menuName: string;
  path: string;
  menuSvgId: string;
  navigationType: MenuStatus;
  menuSort: number;
  /** 权限码 */
  permissionMask: number;
  permissionCodes: string[];
  children: UserMenuVo[];
}
