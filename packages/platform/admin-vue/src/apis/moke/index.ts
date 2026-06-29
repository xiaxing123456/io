import { envMicrServices } from '@admin-vue/utils/env-var';
import Mock from 'mockjs';

Mock.setup({
  timeout: 200, // 设置延迟时间为 1000 毫秒（即 1 秒）
});

const baseUrl = `/api/${envMicrServices.managerServer}`;

const userMenuData = {
  perms: {},
  trees: [
    {
      id: 11,
      parentId: 0,
      url: '/user-homepage',
      menuName: '首页',
      menuCode: 'user-homepage',
      menuSort: 0,
      menuSvgId: '',
      navigationType: 2,
      children: null,
    },
    {
      id: 12,
      parentId: 0,
      url: '/notice',
      menuName: '通知',
      menuCode: 'notice',
      menuSort: 1,
      menuSvgId: '',
      navigationType: 2,
      children: null,
    },
  ],
  navigationType: 2,
};

const companyMenuData = {
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
  navigationType: 1,
};
Mock.mock(`${baseUrl}/sys/navMenu/queryNavMenu`, 'post', options => {
  const params = JSON.parse(options.body || '{}');
  const navigationType = Number(params.navigationType);
  return {
    success: true,
    data: navigationType === 2 ? userMenuData : companyMenuData,
  };
});
