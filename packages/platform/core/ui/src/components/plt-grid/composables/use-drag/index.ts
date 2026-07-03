import type { Ref } from 'vue';
import type { VxeGridProps, VxeTableMethods, VxeTablePropTypes } from 'vxe-table';
import type { PltGridEmits, PltGridOwnProps } from '../../../../types/plt-grid/plt-grid';

import Sortable from 'sortablejs';

interface SortableEvent extends Sortable.SortableEvent {
  to: HTMLElement;
  from: HTMLElement;
  newIndex: number;
  oldIndex: number;
  originalEvent: DragEvent;
}

/**
 * 判断某个元素是否在给定选择器列表中的任意一个容器内（包含容器本身）
 * @param dropTarget   要检测的元素（拖拽释放点下的元素）
 * @param selectors    容器选择器列表，例如 ['.bottom-table-left', '.grid-group']
 */
const isInsideContainers = (dropTarget: Element | null, selectors: string[]): boolean => {
  if (!dropTarget) return false;
  // closest 同时会检测自身和祖先，只要匹配任意一个 selector 就返回对应元素
  return selectors.some(sel => !!dropTarget.closest(sel));
};

/** 占时只支持普通列头(不支持组合列头) */
export const usePltGridDrag = ({
  props,
  attrs,
  emits,
  pltGridRef,
}: {
  props: PltGridOwnProps;
  attrs: VxeGridProps;
  emits: PltGridEmits;
  pltGridRef: Ref<VxeTableMethods | undefined>;
}) => {
  /** 头部单元格className */
  const headerCellClassName: VxeTablePropTypes.HeaderCellClassName = res => {
    const originHeaderCellClassName = attrs.headerCellClassName;
    const headerCellClass =
      typeof originHeaderCellClassName === 'function'
        ? originHeaderCellClassName(res)
        : originHeaderCellClassName;

    // 添加自定义列拖拽样式
    if (!props.customColumnDrag) return headerCellClass;

    if (typeof props.customColumnDragConfig?.disabledMethod === 'function') {
      const isDisabledColumnDrag = props.customColumnDragConfig?.disabledMethod(res.column);
      if (isDisabledColumnDrag) return headerCellClass;
    }

    if (headerCellClass && typeof headerCellClass === 'object') {
      return { ...headerCellClass, 'column-dragend': true };
    }

    return `${headerCellClass || ''} column-dragend`.trim();
  };

  /** 初始化表格列拖拽 */
  const initGridColumnsDrag = () => {
    if (!props.customColumnDrag) return;

    const $pltGridRef = pltGridRef.value as VxeTableMethods;
    const className = '.body--wrapper>.vxe-table--header .vxe-header--row'; // 头部列tr位置

    if (!($pltGridRef as any)?.$el) return;
    const gridHeaderDom = ($pltGridRef as any)?.$el?.querySelector(className);

    Sortable.create(gridHeaderDom, {
      sort: true,
      draggable: '.column-dragend', // 拖拽列
      handle: '.plt-header-drag-btn', // 列拖拽按钮
      // 开始拖拽
      onStart: sortableEvent => {
        const { tableColumn } = $pltGridRef.getTableColumn();
        const { oldIndex } = sortableEvent;
        if (oldIndex === undefined) return;
        emits('column-drag-start', {
          column: tableColumn[oldIndex],
          $event: sortableEvent,
        });
      },
      // 结束拖拽
      onEnd: sortableEvent => {
        const { from, newIndex, oldIndex, originalEvent } = sortableEvent as SortableEvent;

        // 判断有没有拖拽到表格外的组区域
        const { clientX, clientY } = originalEvent;
        const dropTarget = document.elementFromPoint(clientX, clientY);
        const isInside = isInsideContainers(dropTarget, ['.plt-grid-group']);
        const isDropInTable = !isInside;

        const { fullColumn, tableColumn } = $pltGridRef.getTableColumn();
        const oldColumn = tableColumn[oldIndex];
        const newColumn = tableColumn[newIndex];

        // 计算在 fullColumn 中的真实索引
        const oldColumnIndex = $pltGridRef.getColumnIndex(oldColumn);
        const newColumnIndex = $pltGridRef.getColumnIndex(newColumn);

        // 只有「同在表头区域」并且「位置确实变了」才真正调整顺序
        let isColumnReordered = false;
        if (isDropInTable && oldColumnIndex !== newColumnIndex) {
          const [moved] = fullColumn.splice(oldColumnIndex, 1);
          fullColumn.splice(newColumnIndex, 0, moved);

          // fix: PIMC-48424 Sortable.js 在拖拽结束后会直接移动真实 DOM 节点，
          // 导致 Vue 虚拟 DOM 与真实 DOM 不一致，loadColumn 重新渲染时 patch 出错，
          // 筛选行输入框内容与数据列错位。
          // 必须在 emit('update-drag-columns') 之前还原 DOM，
          // 因为 emit 会同步触发父组件的 applyTableColumns -> loadColumn。
          if (oldIndex !== newIndex) {
            const parentEl = from;
            const children = Array.from(parentEl.children);
            const movedEl = children[newIndex];
            if (movedEl) {
              if (oldIndex < newIndex) {
                parentEl.insertBefore(movedEl, children[oldIndex]);
              } else {
                parentEl.insertBefore(movedEl, children[oldIndex]?.nextSibling || null);
              }
            }
          }

          emits('update-drag-columns', fullColumn);
          isColumnReordered = true;
        }

        // 当拖出表格，并拖入到了表格组区域则触发事件
        if (!isDropInTable) {
          emits('column-move-to-group', {
            newColumn,
            oldColumn,
            $event: sortableEvent,
          });
        }

        // applyTableColumns 已在 emit 链中同步处理 loadColumn，
        // 此处跳过避免双重渲染导致列重叠
        if (!isColumnReordered) {
          $pltGridRef.loadColumn(fullColumn);
        }

        // 列拖拽结束
        emits('column-drag-end', {
          newColumn,
          oldColumn,
          fullColumn,
          $event: sortableEvent,
        });
      },
      onMove: sortableEvent => {
        emits('column-drag-move', { $event: sortableEvent });
      },
    });
  };

  return {
    headerCellClassName,
    initGridColumnsDrag,
  };
};
