import type { MenuTreeOptions } from '@admin-vue/apis/system/index.type';

import { queryMenuList } from '@admin-vue/apis/system';
import { MenuStatus } from '@admin-vue/enums/global.enum';
import { systemModuleAccessStore } from '@admin-vue/stores';
import { updateTreeNodeForTree } from '@io-platform/core-common';
import { onMounted, ref } from 'vue';
export const nav = () => {
  const systemModuleAccess = systemModuleAccessStore();
  const currentMenuList = ref<MenuTreeOptions[]>([]);
  const navigationType = ref(MenuStatus.CompanyPerson);
  const menuOptionsProps = {
    label: 'menuName',
    value: 'menuCode',
    children: 'children',
    path: 'url',
  };
  const menuDefaultActive = ref('');

  const formatUrl = (node: MenuTreeOptions): MenuTreeOptions => {
    const { url } = node;
    const urlParams: Record<string, string> = {
      menuCode: node.menuCode,
      navigationType: `${node.navigationType}`,
    };
    const urlParamsString = new URLSearchParams(urlParams).toString();
    const newUrl = url ? `${url}?${urlParamsString}` : '';
    node.url = newUrl;
    return node;
  };

  /**
   * 初始化 TabBar 缓存
   */
  const initTabBarStore = () => {
    if (currentMenuList.value.length === 0) return;
    // 缓存菜单
    systemModuleAccess.setMenuList(navigationType.value, currentMenuList.value);
  };

  /**
   * 初始化导航栏
   */
  const initNav = async () => {
    try {
      const { data } = await queryMenuList({ navType: 1 });
      currentMenuList.value =
        updateTreeNodeForTree({
          treeNode: data.trees,
          updateNode: formatUrl,
        }) || [];

      initTabBarStore();
    } catch (e) {
      logger.error(e);
    }
  };

  onMounted(async () => {
    await initNav();
  });

  return { currentMenuList, menuOptionsProps, menuDefaultActive };
};
