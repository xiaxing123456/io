import type { RouteMetaCustomizeOptions } from '@admin-vue/router/index.type';
import type { RouteRecordRaw } from 'vue-router';

import { RouteMetaCustomizeOpsKey } from '@admin-vue/router/index.enum';
import { HOME_PAGE_NAME } from '@admin-vue/router/modules/config';
import { viewComponent } from '@admin-vue/views';

const customizeOps: RouteMetaCustomizeOptions = {};

export const managementRouters: RouteRecordRaw[] = [
  {
    path: '/homepage-company',
    name: 'homepage-company',
    component: viewComponent.CompanyHomepage,
    meta: {
      title: '首页',
      tag: HOME_PAGE_NAME,
      [RouteMetaCustomizeOpsKey.Name]: {},
    },
  },
  {
    path: '/company-user',
    name: 'company-user',
    component: viewComponent.CompanyUser,
    meta: { title: '公司用户', [RouteMetaCustomizeOpsKey.Name]: customizeOps },
  },
  {
    path: '/company-role',
    name: 'company-role',
    component: viewComponent.CompanyRole,
    meta: { title: '公司角色', [RouteMetaCustomizeOpsKey.Name]: customizeOps },
  },
  {
    path: 'power-management',
    name: 'power-management',
    component: viewComponent.PowerManagemement,
    meta: { title: '权限控制', [RouteMetaCustomizeOpsKey.Name]: customizeOps },
  },
];
