<template>
  <vxe-grid ref="pltGridRef" class="plt-grid" v-bind="getAttrs"></vxe-grid>
</template>
<script lang="ts" setup>
import type { PltGridEmits, PltGridOwnProps } from '../../types/plt-grid/plt-grid';

import { pltGrid } from './plt-grid';
defineOptions({
  name: 'PltGrid',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<PltGridOwnProps>(), {
  showDragBtn: false,
  multipleChoice: true,
  customColumnDrag: false,
});

const emits = defineEmits<PltGridEmits>();

const { pltGridRef, getAttrs } = pltGrid(props, emits);
</script>

<style lang="scss" scoped></style>
