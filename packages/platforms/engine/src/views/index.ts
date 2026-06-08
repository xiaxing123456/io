/** 用于普通路由组件 */
export const viewComponent = {
    Login: () => import('@engine/views/login/login.vue'),
    Main: () => import('@engine/views/layout/main/main.vue'),
    HomepageCompany: () => import('@engine/views/homepage-company/homepage-company.vue'),
};
