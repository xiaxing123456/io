import { systemModuleAccessStore } from '@admin-vue/stores';
import { computed, ref } from 'vue';

export const main = () => {
  const systemModuleAccess = systemModuleAccessStore();

  /** 主页面布局 */
  const layoutMainList = ref([
    { key: 'nav', slot: 'nav', width: 260, minWidth: 80, maxWidth: 400 },
    { key: 'main', slot: 'main' },
  ]);

  const cachedViewNames = computed(() => {
    const navigationType = systemModuleAccess.state.navigationType;
    return [];
  });

  return {
    layoutMainList,
    cachedViewNames,
  };
};
