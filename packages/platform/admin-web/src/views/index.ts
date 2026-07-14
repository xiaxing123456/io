/** 用于普通路由组件 */
export const viewComponent = {
  Login: () => import('@admin-web/views/login/login.vue'),
  PageError403: () => import('@admin-web/views/error/page-error-403.vue'),
  Main: () => import('@admin-web/views/layout/main-layout.vue'),

  CompanyHomepage: () => import('@admin-web/views/company-homepage/company-homepage.vue'), // 公司首页
  CompanyUser: () => import('@admin-web/views/company-user/company-user.vue'), // 公司用户
  CompanyRole: () => import('@admin-web/views/company-role/company-role.vue'), // 公司角色
  PowerManagemement: () => import('@admin-web/views/power-managemement/power-managemement.vue'), // 权限控制

  UserHomepage: () => import('@admin-web/views/user-homepage/user-homepage.vue'), // 用户首页
  Notice: () => import('@admin-web/views/notice/notice.vue'), // 通知
};
