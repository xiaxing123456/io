<template>
  <div class="app-header-tabs">
    <vxe-tabs
      v-model="selectTab"
      :options="tabList"
      type="round-card"
      :show-body="false"
      :show-close="tabList.length > 1"
      @tab-click="tabClickEvent"
      @tab-close="tabCloseEvent"
    >
      <template #tab-suffix>
        <vxe-pulldown
          :options="tabOptions"
          trigger="click"
          show-popup-shadow
          transfer
          @option-click="tabOptionClickEvent"
        >
          <template #default>
            <vxe-button mode="text" icon="vxe-icon-ellipsis-v"></vxe-button>
          </template>
        </vxe-pulldown>
      </template>
    </vxe-tabs>
  </div>
</template>
<script lang="ts" setup>
import type { VxeTabsEvents } from 'vxe-pc-ui';

import { userAccessStore } from '@admin-web/stores/modules/user-access';
import { ClearUserTabType } from '@admin-web/stores/modules/user-access/index.type';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userAccess = userAccessStore();
const selectTab = computed({
  get() {
    return userAccess.activeUserTab;
  },
  set(value) {
    userAccess.activeUserTab = value;
  },
});

const tabList = computed(() => {
  return userAccess.userTabs.map(item => {
    const menuItem = userAccess.menuNameMaps[item.name];
    return {
      title: menuItem ? menuItem.title : item.name,
      name: item.name,
      path: item.path,
      routeLink: {
        name: item.routeName,
        query: item.query,
        params: item.params,
      },
    };
  });
});
const tabOptions = ref([
  { label: '关闭其他页签', value: ClearUserTabType.CloseOther },
  { label: '关闭左侧页签', value: ClearUserTabType.CloseLeft },
  { label: '关闭右侧页签', value: ClearUserTabType.CloseRight },
  { label: '重新加载', value: 'refresh' },
]);

/** tab点击事件 */
const tabClickEvent: VxeTabsEvents.TabClick = ({ name }) => {
  const item = tabList.value.find(item => item.name === name);
  if (item && item.path !== route.fullPath) {
    router.push(item.routeLink);
  }
};

/** tab关闭事件 */
const tabCloseEvent: VxeTabsEvents.TabClose = ({ name }) => {
  const nextItem = userAccess.removeUserTab({ name } as { name: string });
  if (nextItem) {
    if (nextItem.path !== route.fullPath) {
      router.push(nextItem.path);
    }
  }
};

/**  页签配置点击事件 */
const tabOptionClickEvent = ({ option }: { option: { label: string; value: string } }) => {
  switch (option.value) {
    case ClearUserTabType.CloseOther:
    case ClearUserTabType.CloseLeft:
    case ClearUserTabType.CloseRight:
      userAccess.clearUserTab(option.value);
      break;
    case 'refresh':
      appAccess.reloadPage();
      break;
  }
};
</script>

<style lang="scss" scoped>
.app-header-tabs {
  padding-top: 6px;
  padding-right: 16px;
  ::v-deep(.vxe-tabs--round-card) {
    .vxe-tabs-header--item-wrapper {
      padding: 0 8px;
    }
  }
}
</style>
