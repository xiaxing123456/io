import type { VxeTableMethods } from 'vxe-table';

import { computed, ref, unref, useAttrs, useSlots } from 'vue';
import { PltGridProps } from '../../types/plt-grid/plt-grid';
import { useColumns } from './composables/use-columns';

export const pltGrid = (props: PltGridProps) => {
  const attrs = useAttrs();
  const slots = useSlots();

  const pltGridRef = ref<VxeTableMethods>();

  const { getDragColumn, getCheckboxColumn } = useColumns();

  const formatProps = () => {
    // 创建props的本地副本，避免直接修改原始props对象
    const newProps = { ...props };

    // 优化项：全局多选列表最左侧增加固定勾选框列，有拖拽功能时在第二列
    if (
      newProps.multipleChoice &&
      newProps.columns?.[0]?.type !== 'checkbox' &&
      newProps.columns?.[1]?.type !== 'checkbox'
    ) {
      newProps.columns.unshift(getCheckboxColumn());
    }

    // 优化项：全局列拖拽功能
    if (newProps.showDragBtn) {
      newProps.columns.unshift(getDragColumn());
      newProps.rowConfig.drag = true;
    }

    // 给每一列添加字段控制是否抛出单元格双击事件
    newProps.columns.forEach(item => {
      if (!item.params) item.params = {};
      if (item.params.dbCell !== false) {
        item.params.dbCell = true;
      }
    });

    /** 优化项：表格列自动延伸铺满
     * 只需要处理所有列都设置了width的情况下，把最后一列的width改为minWidth，使最后一列自动延伸展示
     */
    const allHaveWidth = newProps.columns.every(col => col.width);
    if (allHaveWidth) {
      const oldColumn = newProps.columns[newProps.columns.length - 1];
      // 最后一列没设置自适应
      if (!oldColumn?.noSelfAdaption) {
        oldColumn.minWidth = oldColumn.width;
        delete oldColumn.width;
      }
    }

    return newProps;
  };

  const getAttrs = computed(() => ({
    ...unref(attrs),
    ...unref(formatProps()),
  }));

  return {
    pltGridRef,
    getAttrs,
  };
};
