import { systemModuleAccessStore } from '@admin-vue/stores';
import { TabBarListOptions } from '@admin-vue/stores/modules/system-module-access/index.type';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export const tabsBar = () => {
  const router = useRouter();
  const route = useRoute();
  const systemModuleAccess = systemModuleAccessStore();

  const activeTabFullPath = computed(() => systemModuleAccess.state.activeTabFullPath);
  const barsList = computed(() => systemModuleAccess.state.tabBarlist);

  onMounted(() => {});

  /** 触发点击切换 */
  const toggleBar = (tab: TabBarListOptions) => {
    if (tab.fullPath === route.fullPath) return;
    router.push(tab.path || tab.fullPath);
  };

  /** 触发关闭 */
  const closeBar = async (tab: TabBarListOptions) => {
    // 不可关闭
    if (tab.closable === false) return;

    systemModuleAccess.removeTab(tab.fullPath);

    const index = barsList.value.findIndex(item => item.fullPath === tab.fullPath);
    const isActive = tab.fullPath === activeTabFullPath.value;

    if (isActive) {
      const nextTab = barsList.value[index - 1] || barsList.value[index] || barsList.value[0];
      if (nextTab) {
        await router.push(nextTab.path || nextTab.fullPath);
      }
    }
  };

  /** 关闭其他标签 */
  const closeOtherTabs = () => {
    // const target = contextMenuTarget.value || currentActiveTab.value;
    // if (!target) return;
    // systemModuleAccess.closeOtherTabs(target.fullPath);
    // router.push(target.path || target.fullPath);
  };

  return {
    barsList,
    activeTabFullPath,
    toggleBar,
    closeBar,
    closeOtherTabs,
  };
};
