<template>
  <vxe-grid ref="pltGridRef" class="plt-grid" v-bind="getAttrs"></vxe-grid>
</template>
<script lang="ts" setup>
import type { PltGridEmits, PltGridProps } from '../../types/plt-grid/plt-grid';

import { pltGrid } from './plt-grid';
defineOptions({
  name: 'PltGrid',
});

const props = withDefaults(defineProps<PltGridProps>(), {
  showDragBtn: false,
  multipleChoice: true,
  rowConfig: () => ({
    keyField: '_X_ROW_KEY',
  }),
  // 鼠标配置项
  mouseConfig: () => ({
    // 	开启单元格选中功能（只对 edit-config.mode=cell 有效）
    selected: true,
  }),
  // 设置表头所有内容过长时显示为省略号
  showHeaderOverflow: 'tooltip',
});
const emits = defineEmits<PltGridEmits>();

const { pltGridRef, getAttrs } = pltGrid(props);
</script>

<style lang="scss" scoped></style>
