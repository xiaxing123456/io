import { MenuStatus } from '@admin-vue/enums/global.enum';
import { RouteMetaCustomizeOpsKey } from '@admin-vue/router/index.enum';
import { RouteMetaCustomizeOptions } from '@admin-vue/router/index.type';
import { LOGIN_PAGE_NAME } from '@admin-vue/router/modules/config';
import { viewComponent } from '@admin-vue/views';
import { RouteRecordRaw } from 'vue-router';

import { managementRouters } from './management-module';
import { userRouters } from './user-module';

const customizeManagementOps: RouteMetaCustomizeOptions = {
  navigationType: MenuStatus.CompanyManagement,
};

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
    path: '/',
    name: 'Main',
    component: viewComponent.Main,
    children: [...managementRouters, ...userRouters],
  },
];
