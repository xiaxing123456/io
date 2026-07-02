import type { VxeGridProps, VxeTableDefines, VxeTablePropTypes } from 'vxe-table';

/** 表格组件属性 */
export interface PltGridProps extends VxeGridProps {
  /** 是否显示表格列拖拽按钮 默认false */
  showDragBtn?: boolean;
  /** 是否多选 默认true */
  multipleChoice?: boolean;
  /** 行配置项 */
  rowConfig: VxeTablePropTypes.RowConfig;
  /** 表格列 */
  columns: PltColumn[];
}
export interface PltGridEmits {}

export interface PltColumn extends VxeTableDefines.ColumnOptions {
  /** 是否自适应宽度- 应用最后一列是否自动扑满 */
  noSelfAdaption?: boolean;
  children?: PltColumn[];
}
