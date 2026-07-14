import { RouteMetaCustomizeOpsKey } from '@admin-web/router/index.enum';
import { RouteMetaCustomizeOptions } from '@admin-web/router/index.type';
import { viewComponent } from '@admin-web/views';
import { RouteRecordRaw } from 'vue-router';

const customizeOps: RouteMetaCustomizeOptions = {};

/** 用户模块路由 */
export const userRouters: RouteRecordRaw[] = [
  {
    path: '/homepage-user',
    name: 'homepage-user',
    component: viewComponent.UserHomepage,
    meta: {
      title: '首页',
      [RouteMetaCustomizeOpsKey.Name]: {},
    },
  },
  {
    path: '/notice',
    name: 'notice',
    component: viewComponent.Notice,
    meta: { title: '通知', [RouteMetaCustomizeOpsKey.Name]: customizeOps },
  },
];
