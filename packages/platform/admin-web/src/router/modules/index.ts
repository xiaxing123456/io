import type { RouteRecordRaw } from 'vue-router';

import { RouteMetaCustomizeOpsKey } from '@admin-web/router/index.enum';
import { LOGIN_PAGE_NAME } from '@admin-web/router/modules/config';
import { viewComponent } from '@admin-web/views';

export const routers: RouteRecordRaw[] = [
  {
    path: '/login',
    name: LOGIN_PAGE_NAME,
    component: viewComponent.Login,
    meta: {
      title: '登录',
      [RouteMetaCustomizeOpsKey.Name]: {
        hiddenTab: true,
      },
    },
  },
];
