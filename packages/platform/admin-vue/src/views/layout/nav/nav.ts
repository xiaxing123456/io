import { useMenu } from '@admin-vue/composables/use-menu/use-menu';
import { MenuStatus } from '@admin-vue/enums/global.enum';
import { systemModuleAccessStore } from '@admin-vue/stores';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
export const nav = () => {
  const { navigationType, menuOptionsProps, menuDefaultActive, currentMenuList, initMenuData } =
    useMenu();

  const menuModelTitle = computed(() =>
    navigationType.value === MenuStatus.CompanyManagement ? '公司管理' : '个人中心'
  );

  const route = useRoute();
  const queryParams = computed(() => route?.query);
  const systemModuleAccess = systemModuleAccessStore();

  /**
   * 初始化导航栏
   */
  const initNav = async () => {
    await initMenuData({ isChangeNavigation: false });
  };

  onMounted(async () => {
    await initNav();
  });

  return {
    menuModelTitle,
    currentMenuList,
    menuOptionsProps,
    menuDefaultActive,
    initMenuData,
  };
};
