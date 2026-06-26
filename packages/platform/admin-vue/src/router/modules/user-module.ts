import type { RouteMetaCustomizeOptions } from '@admin-vue/router/index.type';

import { MenuStatus } from '@admin-vue/enums/global.enum';
import { HOME_PAGE_NAME } from '@admin-vue/router/modules/config';
import { viewComponent } from '@admin-vue/views';
import { RouteRecordRaw } from 'vue-router';
import { RouteMetaCustomizeOpsKey } from '../index.enum';

const customizeOps: RouteMetaCustomizeOptions = {
  navigationType: MenuStatus.CompanyPerson,
};

/** 用户模块路由 */
export const userRouters: RouteRecordRaw[] = [
  {
    path: '/user-homepage',
    name: 'user-homepage',
    component: viewComponent.UserHomepage,
    meta: {
      title: '首页',
      tag: HOME_PAGE_NAME,
      [RouteMetaCustomizeOpsKey.Name]: {
        affix: true,
        keepAlive: true,
        navigationType: MenuStatus.CompanyPerson,
      },
    },
  },
  {
    path: '/notice',
    name: 'notice',
    component: viewComponent.Notice,
    meta: { title: '通知', [RouteMetaCustomizeOpsKey.Name]: customizeOps },
  },
];
