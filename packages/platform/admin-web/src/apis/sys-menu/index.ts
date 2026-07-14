import type { UserMenuVo } from '@admin-web/apis/sys-menu/index.type';

import { envMicrServices } from '@admin-web/utils/env-var';
import { reqGet } from '@admin-web/utils/request';

const baseUrl = envMicrServices.managerServer;

/** 获取当前用户菜单 */
export const currentUserMenu = (): Promise<{ data: UserMenuVo[] }> => {
  return reqGet(`${baseUrl}/sys/navMenu/current`);
};
