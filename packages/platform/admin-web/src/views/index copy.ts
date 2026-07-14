/** 用于普通路由组件 */
export const viewComponent = {
  Login: () => import('@admin-vue/views/login/login.vue'),
  Main: () => import('@admin-vue/views/layout/main/main.vue'),

  CompanyHomepage: () => import('@admin-vue/views/company-homepage/company-homepage.vue'), // 公司首页
  CompanyUser: () => import('@admin-vue/views/company-user/company-user.vue'), // 公司用户
  CompanyRole: () => import('@admin-vue/views/company-role/company-role.vue'), // 公司角色
  PowerManagemement: () => import('@admin-vue/views/power-managemement/power-managemement.vue'), // 权限控制

  UserHomepage: () => import('@admin-vue/views/user-homepage/user-homepage.vue'), // 用户首页
  Notice: () => import('@admin-vue/views/notice/notice.vue'), // 通知
};
