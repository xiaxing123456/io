<template>
  <div class="plt-tree" :style="{ height: `calc(100% - ${boxHeight})` }">
    <vxe-grid ref="treeRef" v-bind="gridOptions" v-on="gridEvent" />
  </div>
</template>

<script lang="ts">
import { renderWithHighlight, searchTreeWithChildren } from './helper';
import type {
  MoveRootType,
  MoveType,
  PltRowId,
  PltTreeRowData,
  PltTreeRowDataKey,
} from '../../types/plt-tree/plt-tree';
import { useResizeObserver } from '@vueuse/core';
import { cloneDeep, debounce, findIndex, pullAt } from 'lodash-es';
import Sortable from 'sortablejs';
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  PropType,
  reactive,
  ref,
  watch,
} from 'vue';
import { VxeGridInstance, VxeGridProps, VxeTableDefines, VxeTablePropTypes } from 'vxe-table';
import { findTree, toTreeArray } from 'xe-utils';

export default defineComponent({
  name: 'PltTree',
  inheritAttrs: false,
  props: {
    /** 树形数据 */
    data: {
      type: Array as PropType<PltTreeRowData[]>,
      default: () => [],
    },
    /** 空数据展示 */
    emptyText: {
      type: String,
      default: () => '',
    },
    /** 默认展开行 */
    defaultExpandedKeys: {
      type: Array as PropType<PltRowId[]>,
      default: () => [],
    },
    /** 默认勾选行 */
    defaultCheckedKeys: {
      type: Array,
      default: () => [],
    },
    /** 是否全部展开 */
    defaultExpandAll: {
      type: Boolean,
      default: () => false,
    },
    /** 是否高亮当前行 */
    highlightCurrent: {
      type: Boolean,
      default: () => true,
    },
    /** 是否显示勾选项 */
    showCheckbox: {
      type: Boolean,
      default: () => false,
    },
    /** 展开收缩触发方式 */
    expandOnClickNode: {
      type: Boolean,
      default: () => false,
    },
    /** 当前高亮的行 */
    currentNodeKey: {
      type: [String, Number],
      default: () => '',
    },
    /** 手风气模式 */
    accordion: {
      type: Boolean,
      default: () => false,
    },
    /** 是否可拖拽 */
    draggable: {
      type: Boolean,
      default: () => false,
    },
    /** 拖拽sortable配置项 */
    sortableOption: {
      type: Object,
      default: () => {
        return {};
      },
    },
    /** 节点渲染时展示数据 */
    props: {
      type: Object,
      default: () => ({}),
    },
    /** 搜索关键字高亮配置 */
    searchOptions: {
      type: Object,
      default: () => ({
        highlight: true,
        highlightClassName: 'tree-text',
      }),
    },
    /** 是否搜索后不清空选中并定位到当前选中可视范围内 */
    isSearchNoClear: {
      type: Boolean,
      default: false,
    },
    /** 缩进 */
    indent: {
      type: Number,
      default: () => 30,
    },
    /** 判断节点能否被拖拽 如果返回 false ，节点不能被拖动 */
    allowDrag: {
      type: Function,
      default: () => true,
    },
    /** 是否允许checkbox */
    isAllowCheckbox: {
      type: Boolean,
      default: true,
    },
    isHeightAuto: {
      type: Boolean,
      default: false,
    },
    boxHeight: {
      type: String,
      default: '0px',
    },
    filterNodeMethod: {
      type: Function as PropType<(value: string, data: PltTreeRowData) => boolean>,
      default: () => null,
    },
    scrollY: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: [
    'current-change',
    'node-click',
    'node-expand',
    'node-collapse',
    'check-change',
    'drag-end',
    'cell-dblclick',
  ],
  setup(props, { slots, emit }) {
    const sortable = ref();
    const treeRef = ref<VxeGridInstance>();
    const searchValue = ref('');
    const treeData = ref(toTreeArray(props.data) as PltTreeRowData[]);
    const { highlightClassName } = props.searchOptions || {};
    const currentRowData = ref<VxeTablePropTypes.Row>();
    const {
      children,
      label,
      value: nodeId,
      parentField,
    } = {
      children: 'children',
      label: 'label',
      value: 'id',
      parentField: 'parentId',
      ...props.props,
    };

    // 折叠行
    const foldRow = computed(() =>
      treeData.value.filter(
        item => !props.defaultExpandedKeys.includes(item[nodeId as keyof typeof item])
      )
    );

    const gridOptions: VxeGridProps = reactive<VxeGridProps>({
      border: 'none',
      height: 'auto',
      emptyText: props.emptyText,
      scrollX: {
        enabled: true,
        gt: 0,
      },
      scrollY: {
        enabled: true,
        gt: 0,
        ...props.scrollY,
      },
      rowConfig: {
        keyField: 'id',
        isCurrent: props.highlightCurrent,
      },
      tooltipConfig: {
        theme: 'light',
      },
      treeConfig: {
        transform: true,
        rowField: nodeId,
        parentField,
        childrenField: children,
        accordion: props.accordion,
        expandAll: props.defaultExpandAll,
        trigger: props.expandOnClickNode ? 'row' : 'default',
        iconClose: 'el-icon-caret-right',
        iconOpen: 'el-icon-caret-right vxe-icon-caret-right rotate90',
        reserve: true,
      },
      checkboxConfig: {
        reserve: true,
        trigger: 'cell',
      },
      columns: [
        {
          field: 'label',
          width: '100%',
          treeNode: true,
          slots: {
            default: (params: any) => {
              return renderWithHighlight(
                params,
                slots,
                label,
                searchValue.value,
                highlightClassName
              );
            },
          },
        },
      ],
      data: treeData.value,
    });

    const gridEvent = {
      cellClick(params: VxeTableDefines.CellClickEventParams) {
        if (props.expandOnClickNode || (!props.expandOnClickNode && !params.triggerTreeNode)) {
          emit('node-click', params.row);
        }
        currentRowData.value = params.row;
      },
      toggleTreeExpand(params: VxeTableDefines.ToggleTreeExpandEventParams) {
        emit(params.expanded ? 'node-expand' : 'node-collapse', params.row);
      },
      currentChange(params: VxeTableDefines.CurrentRowChangeEventParams) {
        emit('current-change', params.row);
      },
      checkboxChange(params: VxeTableDefines.CheckboxChangeEventParams) {
        emit('check-change', params.row, params.checked);
      },
      cellDblclick(params: VxeTableDefines.CellDblclickEventParams) {
        emit('cell-dblclick', params.row);
      },
    };

    /**
     * 滚动到指定节点的位置
     *
     * @param {number} id - 节点id
     */
    const scrollToNode = (id: number) => {
      const rowHeight =
        getComputedStyle(document.body).getPropertyValue('--plt-table-row-height').trim() || '36';

      const offSetHeight = parseInt(rowHeight, 10) - 1;

      // 查找目标节点的索引
      const index = treeData.value.findIndex(item => item.id === id);
      if (index === -1) return; // 如果没有找到节点，直接返回

      // 计算容器高度和总高度
      const treeBoxHeight = treeRef.value?.$el?.offsetHeight || 0;
      const totalHeight = treeData.value.length * offSetHeight;

      // 计算目标滚动位置，居中目标节点
      const targetScrollTop = index * offSetHeight - treeBoxHeight / 2;

      // 确保目标滚动位置在合理范围内
      const scrollTop = Math.min(Math.max(0, targetScrollTop), totalHeight - treeBoxHeight);

      // 使用 requestAnimationFrame 优化滚动体验
      requestAnimationFrame(() => {
        treeRef.value?.scrollTo(0, scrollTop);
      });
    };

    /**
     * 异步设置选中行, 适用于大批量数据选中的场景
     * @param ids
     */
    const asyncSetCheckedRows = async (ids: PltRowId[]) => {
      if (!ids || ids.length === 0) {
        treeRef.value?.clearCheckboxRow();
        return;
      }

      // 使用 Promise.all 批量处理
      await Promise.all(
        ids.map(id => {
          const currentRow = treeRef.value?.getRowById(id);
          if (currentRow) {
            return new Promise(resolve => {
              treeRef.value?.setCheckboxRow(currentRow, true);
              requestAnimationFrame(resolve);
            });
          }
          return Promise.resolve(); // 如果没有找到行，直接返回
        })
      );
    };

    /** 更新数据源 */
    watch(
      () => props.data,
      async () => {
        treeData.value = toTreeArray(props.data) as PltTreeRowData[];
        gridOptions.data = treeData.value;
      }
    );

    /** 获取从根节点到当前节点的数据 */
    const getRootTreeToChildData = (id: PltRowId) => {
      const node = findTree(
        cloneDeep(treeData.value),
        row => row[nodeId as keyof typeof row] === id
      );
      return node ? node.nodes : null;
    };

    /** 获取某一行 */
    const getNode = (id: PltRowId) => {
      return treeRef.value?.getRowById(id);
    };

    /** 默认展开 */
    const formatDefaultExpandedKeys = (ids: PltRowId[]) => {
      const rows = ids.map(id => {
        return getNode(id);
      });
      // 必须先清除所有展开, 如果不清楚，再次设置展开的数据如果已经展开，其他节点状态不会变更
      treeRef.value?.clearTreeExpand();
      treeRef.value?.setTreeExpand(rows, true);
    };

    /** 从根节点展开到当前节点 */
    const expandRootToCurrentRow = (id: PltRowId) => {
      const rows = getRootTreeToChildData(id);
      rows?.forEach(row => {
        const isExpand = treeRef.value?.isTreeExpandByRow(row);
        if (!isExpand) {
          treeRef.value?.setTreeExpand(row, true);
        }
      });
    };

    /** 删除某一行 */
    const remove = (id: PltRowId) => {
      const currentRow = treeRef.value?.getRowById(id);
      treeRef.value?.remove(currentRow);
    };

    /** 获取当前高亮行 */
    const getCurrentRow = () => {
      return treeRef.value?.getCurrentRecord();
    };

    /** 设置当前高亮行 */
    const setCurrentRow = (id: PltRowId, isExpand = true) => {
      nextTick(() => {
        const currentRow = treeRef.value?.getRowById(id);
        if (currentRow) {
          currentRowData.value = currentRow;
          isExpand && expandRootToCurrentRow(id);
        }

        treeRef.value?.setCurrentRow(currentRow || currentRowData.value);
      });
    };
    /** 筛选 */
    const filter = debounce(
      (value: string, key: PltTreeRowDataKey<'label'> = label as PltTreeRowDataKey<'label'>) => {
        searchValue.value = value;
        if (!value) {
          gridOptions.data = treeData.value;
          setTimeout(() => {
            setCurrentRow(currentRowData.value?.id);
            if (props.isSearchNoClear) {
              treeRef.value?.scrollToRow(currentRowData.value);

              scrollToNode(currentRowData.value?.id);
            }
          });

          if (props.showCheckbox) {
            const checkedKeys = props.defaultCheckedKeys;
            const checkedRows = treeData.value.filter(row =>
              checkedKeys.includes(row[nodeId as keyof typeof row])
            );
            treeRef.value?.setCheckboxRow(checkedRows, true);
          }

          return;
        }
        const filteredTree = searchTreeWithChildren(props.data, value, key, props.filterNodeMethod);

        gridOptions.data = toTreeArray(filteredTree);

        // gridOptions.data.forEach(row => {
        //     treeRef.value?.setTreeExpand(row, true);
        // });

        treeRef.value?.setAllTreeExpand(true);

        setTimeout(() => {
          setCurrentRow(currentRowData.value?.id);
          // highlight && setSearchWord(highlightClassName, value);
        });
      },
      500
    );
    /** 自定义过滤 */
    const customFilter = (
      func: (row: PltTreeRowData) => boolean,
      key: PltTreeRowDataKey<'label'> = label as PltTreeRowDataKey<'label'>
    ) => {
      if (!func || typeof func !== 'function') {
        gridOptions.data = treeData.value;
        return;
      }
      const filteredTree = findTree(cloneDeep(props.data), row => func(row), {
        children,
      });
      gridOptions.data = toTreeArray(filteredTree);
      treeRef.value?.setAllTreeExpand(true);
    };
    /** 清除当前高亮行 */
    const clearCurrentRow = () => {
      treeRef.value?.clearCurrentRow();
    };

    /** 获取当前选中的行 */
    const getCheckedRow = () => {
      return treeRef.value?.getCheckboxRecords();
    };

    /** 设置选中行 */
    const setCheckedRow = (id: PltRowId | PltRowId[]) => {
      if (!id) {
        return;
      }
      if (Array.isArray(id)) {
        if (id.length > 0) {
          id.forEach(item => {
            const currentRow = treeRef.value?.getRowById(item);
            if (currentRow) {
              expandRootToCurrentRow(currentRow.id);
              treeRef.value?.setCheckboxRow(currentRow, true);
            }
          });
        } else {
          treeRef.value?.clearCheckboxRow();
        }
      } else {
        const currentRow = treeRef.value?.getRowById(id);
        expandRootToCurrentRow(currentRow.id);
        treeRef.value?.setCheckboxRow(currentRow, true);
      }
    };

    /** 清除选中行 */
    const clearCheckedRow = () => {
      treeRef.value?.clearCheckboxRow();
    };

    /** 设置树展开 */
    const setTreeExpand = (id: PltRowId | PltRowId[]) => {
      if (Array.isArray(id)) {
        id.forEach(item => {
          const currentRow = treeRef.value?.getRowById(item);
          expandRootToCurrentRow(currentRow.id);
        });
      } else {
        const currentRow = treeRef.value?.getRowById(id);
        expandRootToCurrentRow(currentRow.id);
      }
    };

    /** 展开/收起全部节点 */
    const toggleAllTreeExpand = (expand: boolean) => {
      treeRef.value?.setTreeExpand(expand ? treeData.value : foldRow.value, expand);
    };

    /** 关闭树展开 */
    const clearTreeExpand = () => {
      treeRef.value?.clearTreeExpand();
    };

    /** 树拖拽 */
    const treeDrop = () => {
      const $grid = treeRef.value;
      sortable.value = Sortable.create(
        $grid?.$el.querySelector('.plt-tree .vxe-table--body tbody'),
        {
          ...props.sortableOption,
          // sort: false, // 禁用自动排序
          animation: 150,
          onMove: sortableEvent => {
            const targetTrElem = sortableEvent.dragged;
            const currentRowNode = $grid?.getRowNode(targetTrElem);

            return props.allowDrag(currentRowNode?.item);
          },
          onEnd: sortableEvent => {
            console.log('onEnd', sortableEvent);
            const { oldDraggableIndex } = sortableEvent;
            const newDraggableIndex = 5;
            const tableTreeData = cloneDeep(gridOptions.data) as any;
            const targetTrElem = sortableEvent.item;
            const prevTrElem = targetTrElem.previousElementSibling as any;
            const nextTrElem = targetTrElem.nextElementSibling as any;
            const currentRowNode = $grid?.getRowNode(targetTrElem);
            const prevRowNode = $grid?.getRowNode(prevTrElem);
            const nextRowNode = $grid?.getRowNode(nextTrElem);
            // console.log(sortableEvent);
            // console.log('currentRowNode', currentRowNode);
            // console.log('prevRowNode', prevRowNode);
            // console.log('nextRowNode', nextRowNode);

            // 上一个节点的parentId
            const prevRowNodeParentId = prevRowNode?.item?.[parentField];

            // 上一个节点的id
            const prevRowNodeId = prevRowNode?.item?.id;

            // 下一个节点的parentId
            const nextRowNodeParentId = nextRowNode?.item?.[parentField];

            // 获取当前row在treeData中的index
            const currentRowIndex = findIndex(
              tableTreeData,
              (item: PltTreeRowData) => item.id === currentRowNode?.item?.id
            );

            // 修改原来的数组，获取在treeData中当前的row
            const [currentRow] = pullAt(tableTreeData, currentRowIndex) as PltTreeRowData[];

            /** 当前节点下的所有子节点id */
            const currentRowChildrenIds = toTreeArray([currentRow])
              .filter(item => item.id !== currentRow.id)
              .map(item => item.id);

            /** 获取节点的所有子节点数量 */
            const getChildrenLength = (list: PltTreeRowData) => toTreeArray([list]).length;

            /** 修改源数组，返回当前节点下面的所有子节点并且组装成一个一维数组 */
            const getCurrentRowChildrens = (row: PltTreeRowData, index: number) => {
              const childrenLength = getChildrenLength(row);
              const spliceArray = tableTreeData.splice(index, childrenLength - 1);
              spliceArray.unshift(row);
              return spliceArray;
            };

            /** 手动展开树, 展开的树直接拖动子节点显示有问题 */
            const expandTree = (row: PltTreeRowData) => {
              const isExpand = $grid?.isTreeExpandByRow(row);
              if (isExpand) {
                $grid?.toggleTreeExpand(row);
                nextTick(() => {
                  $grid?.toggleTreeExpand(row);
                });
              }
            };

            // 移动节点到根节点
            const moveNodeToRoot = (row: PltTreeRowData, type: MoveRootType) => {
              row[parentField as 'id'] = '';
              // 如果拖拽的节点有子节点
              if (row.children && row.children.length > 0) {
                const spliceArray = getCurrentRowChildrens(currentRow, currentRowIndex);
                tableTreeData[type === 'top' ? 'unshift' : 'push'](...spliceArray);
                expandTree(row);
              } else {
                // 单个节点拖拽
                tableTreeData[type === 'top' ? 'unshift' : 'push'](row);
              }
            };

            // 移动节点
            const moveNode = (row: PltTreeRowData, type: MoveType) => {
              // 获取当前节点的所有子节点
              let spliceArray;
              if (row.children && row.children.length > 0) {
                spliceArray = getCurrentRowChildrens(currentRow, currentRowIndex);
              }
              // 获取上个节点的index
              let index = findIndex(
                tableTreeData,
                (item: PltTreeRowData) => item.id === prevRowNodeId
              );
              if (['middle', 'bottom'].includes(type)) {
                // 如果上个节点有子节点
                if (prevRowNode && prevRowNode.item.children) {
                  index += getChildrenLength(prevRowNode.item);
                }
                currentRow[parentField as keyof typeof currentRow] = prevRowNodeParentId;
                // 当前节点如果有子节点
                if (spliceArray) {
                  tableTreeData.splice(index, 0, ...spliceArray);
                } else {
                  // 单节点拖拽
                  tableTreeData.splice(index, 0, currentRow);
                }
              } else {
                currentRow[parentField as keyof typeof currentRow] = prevRowNodeId;
                if (spliceArray) {
                  tableTreeData.splice(index + 1, 0, ...spliceArray);
                } else {
                  tableTreeData.splice(index + 1, 0, currentRow);
                }
              }
              expandTree(currentRow);
            };

            // 禁止拖到外面导致节点消失
            if (newDraggableIndex === oldDraggableIndex && (!prevRowNode || !nextRowNode)) {
              gridOptions.data = $grid?.getTableData().visibleData;
              return;
            }

            // 禁止拖拽自己到子节点内部导致节点消失
            if (
              currentRowChildrenIds.includes(prevRowNode?.item.id) ||
              currentRowChildrenIds.includes(nextRowNode?.item.id)
            ) {
              gridOptions.data = $grid?.getTableData().visibleData;
              expandTree(currentRow);
              return;
            }

            // 拖拽位置不变, 不处理
            if (!currentRowNode || newDraggableIndex === oldDraggableIndex) {
              return;
            }

            // 上下都有节点
            if (prevTrElem && nextTrElem) {
              // 如果上一个节点是下一个节点的父节点，拖到头部
              if (prevRowNodeId === nextRowNodeParentId) {
                moveNode(currentRow, 'top');
              } else if (prevRowNodeParentId === nextRowNodeParentId) {
                // 如果上下两个节点parentId相等的话，拖到中间
                moveNode(currentRow, 'middle');
              } else {
                // 拖到尾部
                moveNode(currentRow, 'bottom');
              }
            } else if (!prevTrElem && nextTrElem) {
              // 没有上一个节点
              moveNodeToRoot(currentRow, 'top');
            } else if (prevTrElem && !nextTrElem) {
              // 没有下一个节点
              if (!prevRowNodeParentId) {
                moveNodeToRoot(currentRow, 'bottom');
              } else {
                moveNode(currentRow, 'bottom');
              }
            }
            // 如果变动了树层级，需要刷新数据
            gridOptions.data = [...tableTreeData];

            emit('drag-end', currentRowNode?.item);
          },
        }
      );
    };

    /** 初始化tree checkbox配置项 */
    const initCheckBoxConfig = () => {
      if (props.showCheckbox) {
        gridOptions.checkboxConfig = {
          labelField: 'label',
          checkRowKeys: props.defaultCheckedKeys as any,
          checkMethod: () => props.isAllowCheckbox,
          checkField: '$_checkField', // 解决性能问题（当前表格存在1k+数据量，全选浏览器会卡顿）
          highlight: true,
          trigger: 'cell',
        };
        gridOptions.columns = [
          {
            type: 'checkbox',
            treeNode: true,
            showOverflow: true,
            slots: {
              default: (params: any) => {
                params.row.label = params.row[label];
                if (slots && slots.default) {
                  return renderWithHighlight(
                    params,
                    slots,
                    label,
                    searchValue.value,
                    highlightClassName
                  );
                }
                // 如果没有传递插槽，直接返回文本内容
                return params.row[label];
              },
            },
          },
        ];
      }
    };

    /** 初始化当前高亮节点 */
    const initCurrentNodeKey = () => {
      if (props.currentNodeKey) {
        nextTick(() => {
          setCurrentRow(props.currentNodeKey);
        });
      }
    };

    /** 初始化拖拽 */
    const initDraggable = () => {
      if (props.draggable) {
        treeDrop();
      }
    };

    /** 获取勾选项id */
    const getCheckedKeys = () => {
      // 获取已勾选的行数据
      const selectedRows = treeRef.value?.getCheckboxRecords() || [];
      return selectedRows.map((row: PltTreeRowData) => row.id);
    };

    /**
     * 给指定的树节点追加子节点
     *
     * @param {Object} newNode - 要添加的新节点对象
     * @param {string} parentId - 父节点的 id，指定在哪个节点下追加新节点
     */
    const appendChildNode = (parentId: string, newNode: any) => {
      const parentNode = treeRef.value?.getRowById(parentId);
      gridOptions.data?.push(newNode);
      if (parentNode) {
        setTreeExpand(parentId);
      } else {
        console.error(`未找到 id 为 ${parentId} 的父节点`);
      }
    };

    /**
     * 给指定的树节点移除子节点
     */
    const removeChildNode = async (node: VxeTablePropTypes.Row) => {
      await treeRef.value?.remove(node);
      const ids = toTreeArray([node]).map(e => e.id);
      gridOptions.data = gridOptions.data?.filter(
        (e: VxeTablePropTypes.Row) => !ids.includes(e.id)
      );
    };

    watch(
      () => props.defaultExpandedKeys,
      async (ids: PltRowId[]) => {
        setTimeout(() => {
          formatDefaultExpandedKeys(ids);
        });
      },
      {
        immediate: true,
      }
    );

    // watch(
    //     () => props.defaultCheckedKeys,
    //     () => {
    //         asyncSetCheckedRows(props.defaultCheckedKeys as any);
    //     },
    //     {
    //         deep: true,
    //     }
    // );

    /** 监听 vxe-table--body 宽度变化，记录最大宽度作为 min-width，防止虚拟滚动导致高亮宽度回缩 */
    const initBodyResizeObserver = () => {
      const bodyEl = treeRef.value?.$el?.querySelector('.vxe-table--body') as HTMLElement;
      if (!bodyEl) return;
      let maxWidth = bodyEl.offsetWidth;

      useResizeObserver(bodyEl, entries => {
        const currentWidth = entries[0].contentRect.width;
        if (currentWidth > maxWidth) {
          maxWidth = currentWidth;
          bodyEl.style.minWidth = `${currentWidth}px`;
        }
      });
    };

    /** lifecycle */
    onMounted(() => {
      initCheckBoxConfig();
      initCurrentNodeKey();
      initDraggable();
      initBodyResizeObserver();
    });

    onUnmounted(() => {
      if (sortable.value) {
        sortable.value.destroy();
      }
    });

    return {
      treeRef,
      treeData,
      gridOptions,
      gridEvent,
      filter,
      sortable,
      searchValue,
      getRootTreeToChildData,
      remove,
      getNode,
      setCurrentRow,
      getCurrentRow,
      clearCurrentRow,
      setCheckedRow,
      getCheckedRow,
      clearCheckedRow,
      setTreeExpand,
      clearTreeExpand,
      getCheckedKeys,
      toggleAllTreeExpand,
      appendChildNode,
      removeChildNode,
      asyncSetCheckedRows,
      currentRowData,
      customFilter,
    };
  },
});
</script>

<style src="./plt-tree.scss" scoped></style>
