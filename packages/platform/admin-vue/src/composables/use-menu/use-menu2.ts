// import type { MenuTreeOptions } from '@admin-vue/apis/system/index.type';

// import { queryMenuList } from '@admin-vue/apis/system';
// import { useHelper } from '@admin-vue/composables/use-menu/helper';
// import { MenuStatus } from '@admin-vue/enums/global.enum';
// import { systemModuleAccessStore } from '@admin-vue/stores';
// import { updateTreeNodeForTree } from '@io-platform/core-common';
// import { computed, ref } from 'vue';
// import { useRoute, useRouter } from 'vue-router';

// interface RouteQueryParams {
//   navigationType?: MenuStatus;
// }
// export const useMenu = () => {
//   const router = useRouter();
//   const route = useRoute();
//   const systemModuleAccess = systemModuleAccessStore();
//   const queryParams = computed(() => router.currentRoute.value.query as RouteQueryParams);

//   const {
//     getOppositeNavigationType,
//     resolveNavigationType,
//     formatUrl,
//     findFirstAvailableMenu,
//     findMenuByUrl,
//     createTabByMenu,
//   } = useHelper(route, systemModuleAccess);

//   const navigationType = computed(() => {
//     return systemModuleAccess.state.navigationType;
//   });
//   const menuOptionsProps = {
//     label: 'menuName',
//     value: 'menuCode',
//     children: 'children',
//     path: 'url',
//   };
//   const menuDefaultActive = ref('');
//   const currentMenuList = ref<MenuTreeOptions[]>([]);
//   /**
//    * 初始化菜单数据
//    * @param type 菜单类型 传参代表切换菜单类型
//    */
//   const initMenuData = async ({ isChangeNavigation = false }) => {
//     try {
//       // 判断菜单类型
//       const targetNavigationType = isChangeNavigation
//         ? getOppositeNavigationType(systemModuleAccess.state.navigationType)
//         : resolveNavigationType();
//       const { data } = await queryMenuList({ navigationType: targetNavigationType });

//       // 初始化当前菜单路由
//       const menuList =
//         updateTreeNodeForTree({
//           treeNode: data.trees,
//           updateNode: formatUrl,
//         }) || [];
//       currentMenuList.value = menuList;
//       systemModuleAccess.setNavigationType(targetNavigationType);
//       systemModuleAccess.setMenuList(menuList);

//       // 获取默认菜单
//       const defaultMenu = findFirstAvailableMenu(menuList);
//       const currentMenu = findMenuByUrl(menuList, route.fullPath);
//       const activeMenu = currentMenu || defaultMenu;

//       menuDefaultActive.value = activeMenu?.url || '';

//       // 跳转默认菜单
//       if (isChangeNavigation && defaultMenu) {
//         const homeTab = createTabByMenu(defaultMenu);
//         systemModuleAccess.setTabBarList([homeTab]);
//         systemModuleAccess.setActiveTab(homeTab.fullPath);
//         await router.push(defaultMenu.url);

//         return;
//       }

//       // 如果路由是/ 则跳转到首页去
//       if (route.path === '/' && defaultMenu) {
//         await router.push(defaultMenu.url);
//       }
//     } catch (e) {
//       logger.error(e);
//     }
//   };

//   return {
//     navigationType,
//     menuOptionsProps,
//     menuDefaultActive,
//     currentMenuList,
//     initMenuData,
//   };
// };
