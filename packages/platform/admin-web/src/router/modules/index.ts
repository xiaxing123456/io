import type { RouteRecordRaw } from 'vue-router';

import { RouteMetaCustomizeOpsKey } from '@admin-web/router/index.enum';
import { LOGIN_PAGE_NAME } from '@admin-web/router/modules/config';
import { managementRouters } from '@admin-web/router/modules/management-module';
import { userRouters } from '@admin-web/router/modules/user-module';
import { viewComponent } from '@admin-web/views';

export const routers: RouteRecordRaw[] = [
  {
    path: '/login',
    name: LOGIN_PAGE_NAME,
    component: viewComponent.Login,
    meta: {
      title: '登录',
      [RouteMetaCustomizeOpsKey.Name]: {},
    },
  },
  {
    path: '/403',
    name: 'PageError403',
    component: viewComponent.PageError403,
    meta: {
      title: '403 无权限访问',
    },
  },

  {
    path: '/',
    name: 'Main',
    component: viewComponent.Main,
    children: [...managementRouters, ...userRouters],
  },
];
