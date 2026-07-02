import { MenuStatus } from '@admin-vue/enums/global.enum';
import { adminAccessStore } from '@admin-vue/stores';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export const nav = () => {
  const route = useRoute();
  const router = useRouter();
  const adminAccess = adminAccessStore();
  const queryParams = computed(() => route?.query);

  const menuDefaultActive = computed(() => {
    const { fullPath } = route;
    return fullPath;
  });
  const navigationType = computed(() => adminAccess.state.navigationType);
  const menuModelTitle = computed(() =>
    navigationType.value === MenuStatus.CompanyManagement ? '公司管理' : '个人中心'
  );
  const menuOptionsProps = {
    label: 'menuName',
    value: 'menuCode',
    children: 'children',
    path: 'fullUrl',
  };
  const currentMenuList = computed(() => adminAccess.state.menuList);

  /** 切换导航类型 */
  const changeNavigationType = async () => {
    // 1. 重新初始化菜单数据
    const type =
      navigationType.value === MenuStatus.CompanyManagement
        ? MenuStatus.CompanyPerson
        : MenuStatus.CompanyManagement;
    await adminAccess.initMenuList(type);
    const homeUrl = adminAccess.getMenuHomeUrl() || '/';
    // 2. 跳转首页
    router.push(homeUrl);
  };

  return {
    menuModelTitle,
    currentMenuList,
    menuOptionsProps,
    menuDefaultActive,
    changeNavigationType,
  };
};
