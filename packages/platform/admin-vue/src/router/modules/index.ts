import { RouteMetaCustomizeOpsKey } from '@admin-vue/router/index.enum';
import { LOGIN_PAGE_NAME } from '@admin-vue/router/modules/config';
import { viewComponent } from '@admin-vue/views';
import { RouteRecordRaw } from 'vue-router';

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
  },
];
