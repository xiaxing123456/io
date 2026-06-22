import type { MenuDto, MenuInfoVo } from '@admin-vue/apis/system/index.type';

import { envMicrServices } from '@admin-vue/utils/env-var';
import { reqPost } from '@admin-vue/utils/request';

const baseUrl = `${envMicrServices.managerServer}`;

/** 查询菜单列表 */
export const queryMenuList = async (data: MenuDto): Promise<Vo<MenuInfoVo>> => {
  return reqPost(`${baseUrl}/sys/navMenu/queryNavMenu`, data);
};
