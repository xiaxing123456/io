import type { VxeGridProps, VxeTableMethods } from 'vxe-table';

import { computed, nextTick, onMounted, ref, useAttrs } from 'vue';
import type { PltGridEmits, PltGridOwnProps } from '../../types/plt-grid/plt-grid';
import { usePltGridDrag } from './composables/use-drag';

export const pltGrid = (props: PltGridOwnProps, emits: PltGridEmits) => {
  const attrs = useAttrs() as VxeGridProps;

  const pltGridRef = ref<VxeTableMethods>();

  // 统一的列配置管理
  const { headerCellClassName, initGridColumnsDrag } = usePltGridDrag({ props, attrs, emits, pltGridRef });

  const getAttrs = computed(() => {
    const gridAttrs: VxeGridProps & Record<string, unknown> = { ...attrs };

    if (props.customColumnDrag || attrs.headerCellClassName) {
      gridAttrs.headerCellClassName = headerCellClassName;
    }

    return gridAttrs;
  });

  onMounted(async () => {
    await nextTick();
    // 初始化表格拖拽列
    initGridColumnsDrag();
  });

  return {
    pltGridRef,
    getAttrs,
  };
};
