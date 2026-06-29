<template>
  <div class="menu-demo">
    <plt-menu
      :data="menuData"
      :fieldNames="menuProps"
      :default-active="menuDefaultActive"
      :router="true"
      @node-click="handleNodeClick"
    >
      <template #content="{ node }">
        <menu-item :node="node"></menu-item>
      </template>
    </plt-menu>
  </div>
</template>

<script lang="ts" setup>
import type { MenuTreeOptions } from '@admin-vue/apis/system/index.type';

import MenuItem from '@admin-vue/views/layout/sidebar/menu/menu-item.vue';

defineOptions({
  name: 'AppMenu',
});

const props = withDefaults(
  defineProps<{
    menuData: MenuTreeOptions[];
    menuProps: AnyObj;
    menuDefaultActive: string;
  }>(),
  {}
);
const handleNodeClick = (data: any, node: any, event: MouseEvent) => {
  console.log('点击菜单：', data, node, event);
};
</script>

<style lang="scss" scoped>
.menu-demo {
  height: 100%;
}

:deep(.plt-virtually-list__client) {
  height: 100%;
  overflow-y: auto;
}
</style>
