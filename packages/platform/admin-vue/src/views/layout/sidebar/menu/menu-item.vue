<template>
  <div class="menu-item">
    <plt-tooltip :content="node.menuName">
      <span>{{ node.menuName }}</span>
    </plt-tooltip>
  </div>
</template>
<script lang="ts" setup>
import type { MenuTreeOptions } from '@admin-vue/stores/modules/admin-access/index.type';

const props = withDefaults(
  defineProps<{
    node: MenuTreeOptions;
  }>(),
  {}
);
</script>

<style lang="scss" scoped>
.menu-item {
  width: 100%;
}
</style>
