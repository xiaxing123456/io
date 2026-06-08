import type { RouteRecordRaw } from 'vue-router';

import { RouteMetaCustomizeOpsKey } from '@engine/router/index.enum';
import { viewComponent } from '@engine/views';

export const routers: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
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
        children: [
            {
                path: '/homepage-company',
                name: 'homepage-company',
                redirect: '/homepage-company',
                meta: { title: '首页', loaderComponent: viewComponent.HomepageCompany },
            },
        ],
    },
];
