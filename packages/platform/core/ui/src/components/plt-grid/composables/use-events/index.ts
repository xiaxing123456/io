import type { Ref } from 'vue';
import type { VxeTableEvents, VxeTableMethods } from 'vxe-table';
import type { PltGridEmits, PltGridProps } from '../../../../types/plt-grid/plt-grid';

export const usePltGridEvent = ({
  props,
  emits,
  pltGridRef,
}: {
  props: PltGridProps;
  emits: PltGridEmits;
  pltGridRef: Ref<VxeTableMethods | undefined>;
}) => {
  /** 处理点击cell(单元格事件) */
  const onCellClick: VxeTableEvents.CellClick = options => {};
  return;
};
