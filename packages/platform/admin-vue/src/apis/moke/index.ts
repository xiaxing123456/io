import { envMicrServices } from '@admin-vue/utils/env-var';
import Mock from 'mockjs';

Mock.setup({
  timeout: 1000, // 设置延迟时间为 1000 毫秒（即 1 秒）
});

const baseUrl = `/api/${envMicrServices.managerServer}`;

Mock.mock(`${baseUrl}/sys/navMenu/queryNavMenu`, 'post', {
  data: {
    perms: {},
    trees: [
      {
        id: 0,
        parentId: 0,
        url: '/homepage-company',
        menuName: '首页',
        menuCode: 'homepage-company',
        menuSort: 0,
        menuSvgId: '',
        navigationType: 1,
        children: null,
      },
      {
        id: 1,
        parentId: 0,
        url: '',
        menuName: '用户管理',
        menuCode: 'user-management',
        menuSort: 1,
        menuSvgId: '',
        navigationType: 1,
        children: [
          {
            id: 2,
            parentId: 1,
            url: '/company-user',
            menuName: '公司用户',
            menuCode: 'company-user',
            menuSort: 1,
            menuSvgId: '',
            navigationType: 1,
            children: null,
          },
          {
            id: 3,
            parentId: 1,
            url: '/company-role',
            menuName: '公司角色',
            menuCode: 'company-role',
            menuSort: 2,
            menuSvgId: '',
            navigationType: 1,
            children: null,
          },
        ],
      },
    ],
  },
  success: true,
});
