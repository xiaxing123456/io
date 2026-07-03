import type { Sortable } from 'sortablejs';
import type { VxeGridProps, VxeTableDefines } from 'vxe-table';

/** plt-grid 自有属性，避免把 VxeGridProps 的 boolean 默认值透传成 false */
export interface PltGridOwnProps {
  /** 是否显示表格列拖拽按钮 默认false */
  showDragBtn?: boolean;
  /** 是否多选 默认true */
  multipleChoice?: boolean;

  /** 自定义列拖拽 默认false */
  customColumnDrag?: boolean;
  customColumnDragConfig?: {
    /** 是否禁用拖拽按钮，该返回值决定是否为拖拽按钮禁用状态 */
    disabledMethod?: (column: VxeTableDefines.ColumnInfo) => boolean;
  };
}

/** 表格组件属性：对外保留 VXE 配置类型，组件内部 defineProps 只使用 PltGridOwnProps */
export type PltGridProps = Omit<VxeGridProps, 'columns'> & PltGridOwnProps & {
  /** 表格列 */
  columns?: PltColumn[];
};

export interface PltGridEmits {
  /** 列拖拽开始 */
  (
    e: 'column-drag-start',
    res: {
      column: VxeTableDefines.ColumnInfo;
      $event: Sortable.SortableEvent;
    }
  ): void;
  /** 更新拖拽列 */
  (e: 'update-drag-columns', fullColumn: VxeTableDefines.ColumnInfo[]);
  /** 脱出表格触发事件 */
  (
    e: 'column-move-to-group',
    res: {
      newColumn: VxeTableDefines.ColumnInfo;
      oldColumn: VxeTableDefines.ColumnInfo;
      $event: Sortable.SortableEvent;
    }
  );
  /** 列拖拽结束 */
  (
    e: 'column-drag-end',
    res: {
      newColumn: VxeTableDefines.ColumnInfo;
      oldColumn: VxeTableDefines.ColumnInfo;
      fullColumn: VxeTableDefines.ColumnInfo[];
      $event: Sortable.SortableEvent;
    }
  );
  /**列拖拽移动 */
  (
    e: 'column-drag-move',
    res: {
      $event: Sortable.SortableEvent;
    }
  );
}

export interface PltColumn extends VxeTableDefines.ColumnOptions {
  /** 是否自适应宽度- 应用最后一列是否自动扑满 */
  noSelfAdaption?: boolean;
  children?: PltColumn[];
}
