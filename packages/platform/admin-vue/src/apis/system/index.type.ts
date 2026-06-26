import { MenuStatus } from '@admin-vue/enums/global.enum';

/** 菜单接口参数 */
export interface MenuDto {
  navigationType: MenuStatus;
}

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

export interface MenuInfoVo {
  /** 菜单权限信息 */
  perms: {
    [key: string]: number;
  };
  trees: MenuTreeOptions[];
}
