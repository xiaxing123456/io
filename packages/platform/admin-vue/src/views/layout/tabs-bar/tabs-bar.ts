import { adminAccessStore } from '@admin-vue/stores';
import { TabBarListOptions } from '@admin-vue/stores/modules/admin-access/index.type';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export const tabsBar = () => {
  const router = useRouter();
  const route = useRoute();
  const adminAccess = adminAccessStore();

  /** 判断是否是激活的标签 */
  const isTabActive = (tag: TabBarListOptions) => {
    return route.fullPath === tag.fullPath;
  };
  const barsList = computed(() => adminAccess.state.tabBarList);

  onMounted(() => {});

  /** 触发点击切换 */
  const toggleBar = (tab: TabBarListOptions) => {
    if (tab.fullPath === route.fullPath) return;
    router.push(tab.fullPath || tab.path);
  };

  /** 触发关闭 */
  const closeBar = async (tab: TabBarListOptions) => {
    // 不可关闭
    if (tab.closable === false) return;

    const index = barsList.value.findIndex(item => item.fullPath === tab.fullPath);
    const isActive = tab.fullPath === route.fullPath;

    // 删除
    adminAccess.removeTabBar(tab.fullPath);

    // 跳转
    if (isActive) {
      const nextTab = barsList.value[index - 1] || barsList.value[index] || barsList.value[0];
      await router.push(nextTab?.fullPath || '/');
    }
  };

  /** 关闭其他标签 */
  const closeOtherTabs = () => {};

  return {
    isTabActive,
    barsList,
    toggleBar,
    closeBar,
    closeOtherTabs,
  };
};
