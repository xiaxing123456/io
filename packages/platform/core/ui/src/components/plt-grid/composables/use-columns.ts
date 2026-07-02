import { PltColumn } from '../../../types/plt-grid/plt-grid';
import { PltGridColumnField } from '../../../types/plt-grid/plt-grid.enum';

export const useColumns = () => {
  /** 获取拖拽列配置 */
  const getDragColumn = (): PltColumn => ({
    field: PltGridColumnField.Drag,
    width: '50',
    fixed: 'left',
    params: { dbCell: false },
  });

  /** 获取复选框列配置 */
  const getCheckboxColumn = (): PltColumn => ({
    field: PltGridColumnField.Checkbox,
    type: 'checkbox',
    width: '50',
    fixed: 'left',
    params: { dbCell: false, isAllCheckbox: true },
  });

  return {
    getDragColumn,
    getCheckboxColumn,
  };
};
