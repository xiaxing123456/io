import { queryMenuList } from '@admin-vue/apis/system';
import { useHelper } from '@admin-vue/composables/use-menu/helper';
import { MenuStatus } from '@admin-vue/enums/global.enum';
import { updateTreeNodeForTree } from '@io-platform/core-common';

export const useMenu = () => {
  const {
    getOppositeNavigationType,
    formatUrl,
    findFirstAvailableMenu,
    findMenuByUrl,
    createTabByMenu,
  } = useHelper();

  /** 设置菜单数据 */
  const getMenuData = async (navigationType: MenuStatus) => {
    const { data } = await queryMenuList({ navigationType });

    const menuList =
      updateTreeNodeForTree({
        treeNode: data.trees,
        updateNode: formatUrl,
      }) || [];

    return menuList;
  };

  return {
    getMenuData,
  };
};
