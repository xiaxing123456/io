import PltVirtuallyList from '../../../plt-virtually-list/plt-virtually-list';
import { useTextWidth } from '../composables/use-text-width';
import type { ITreeNode } from '../type';
import { calculateMenuPosition } from '../util';
import { computed, defineComponent, h, nextTick, onMounted, PropType, ref } from 'vue';

export default defineComponent({
  name: 'CascaderMenu',
  props: {
    /** 当前选中的节点 */
    currentNode: {
      type: [Number, String],
      default: 0,
    },
    /** 渲染数据 */
    options: {
      type: Array as PropType<ITreeNode[]>,
      default: () => [],
    },
    /** 父级元素相对于视口的 top 值 */
    parentTop: {
      type: Number,
      default: 0,
    },
  },
  emits: ['handleClickMenu', 'toggleCollapseContent'],
  setup(props, { emit, slots }) {
    /** 用于引用虚拟列表组件实例的引用，初始值为 null */
    const virListRef = ref();
    /** 计算每个菜单项的高度，用于计算子菜单的位置，从 CSS 变量获取 */
    const cascaderItemHeight = ref(
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--plt-menu-row-height'),
        10
      ) || 42
    );
    /** 当前悬停的路径节点数组，存储每一级菜单中悬停的节点 */
    const hoveredPath = ref<ITreeNode[]>([]);

    /** 存储悬停节点的索引，键为节点，值为该节点在当前级别的索引 */
    const hoveredIndexes = ref<
      Map<ITreeNode, { index: number; width: number; offsetTop: number; curWidth: number }>
    >(new Map());

    /** 存储悬停事件的超时定时器，便于在需要时清除 */
    const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

    /** 计算父级菜单的顶部位置，用于定位子菜单 */
    const parentTop = computed(() => props.parentTop);

    /** 计算当前激活的菜单节点，根据传入的 `currentNode` 属性 */
    const currentNode = computed(() => props.currentNode);

    /** 获取计算文本宽度的函数，基于 '.plt-menu' DOM 元素 */
    const getMaxTextWidthRef = ref<((options: any[]) => number) | null>(null);

    /** 计算主菜单的宽度，取决于 `props.options` 中的最大文本宽度 */
    const menuWidth = computed(() => getMaxTextWidthRef.value?.(props.options) || 0);

    /** 存储当前悬停的菜单项的 DOM 元素 */
    const cascaderItemRef = ref<HTMLElement | null>(null);

    /** 存储当前悬停的菜单项的 DOM-label 元素，用于宽度计算 */
    const cascaderItemLabelRef = ref<HTMLElement | null>(null);

    /**
     * 处理鼠标悬停逻辑
     * @param item 选中的树节点
     * @param level 当前层级
     * @param index 节点的索引
     * @param event 鼠标事件
     */
    const handleMouseEnter = async (
      item: ITreeNode,
      level: number,
      index: number,
      event: MouseEvent
    ) => {
      const curIndex = item.children?.findIndex(node => node.key === currentNode.value);
      const isCurrent = hoveredPath.value?.[level]?.key === item.key;
      const { top } = (event.target as HTMLElement)?.getBoundingClientRect() || {};

      setTimeout(() => {
        if (curIndex !== -1 && item.children?.length && !isCurrent) {
          virListRef.value?.scrollIntoView(curIndex);
        }
      });

      if (hoverTimeout.value) clearTimeout(hoverTimeout.value);
      emit('toggleCollapseContent', true);

      if (!item.children?.length) {
        // 兼容子级菜单有子级菜单的情况，需要去掉多余的菜单
        if (hoveredPath.value[level]?.children?.length) {
          hoveredPath.value[level] = item;
        }
        return;
      }

      hoveredPath.value = hoveredPath.value?.slice(0, level + 1);

      if (isCurrent) return;

      await nextTick();

      hoveredPath.value[level] = item;
      const width = getMaxTextWidthRef.value?.(item.children as ITreeNode[]) || 0;
      hoveredIndexes.value.set(item, {
        index,
        width: (event.target as HTMLElement)?.offsetWidth,
        curWidth: width,
        offsetTop: top,
      });
    };

    /**
     * 处理鼠标移除逻辑
     */
    const handleMouseLeave = () => {
      emit('toggleCollapseContent', false);
      hoverTimeout.value = setTimeout(() => {
        hoveredPath.value = [];
      }, 200);
    };

    let needOffsetParentId = -1;
    /**
     * 计算菜单项的 top 值
     * @param item 当前的树节点
     * @returns 计算得到的 top 和 left 值
     */
    const calculatePosition = (
      item: ITreeNode
    ): { top: number; left: number; needOffsetParentId: number; curWidth: number } => {
      let top = 0;
      let left = 0;
      let curWidth = 0;
      let current = item;

      const marginLeft = 6;
      while (current.parent) {
        const {
          width = 0,
          offsetTop = 0,
          curWidth: currentWidth = 0,
        } = hoveredIndexes.value.get(current) || {};
        // 累计父级的 top 值
        top = top || offsetTop;
        // 累计父级的宽度，作为 left 值的基础
        left = left + width + marginLeft;
        curWidth = curWidth || currentWidth;
        current = current.parent;
      }

      if (left + curWidth > document.body.clientWidth) {
        needOffsetParentId = item?.id as number;
        hoveredIndexes.value.delete(item);
      }

      // const realLeft = left > document.body.clientWidth ? parentLeft : left;
      // 返回计算后的 top 和 left 值
      return { top, left, needOffsetParentId, curWidth };
    };

    /**
     * 处理菜单点击事件
     * @param itemData 当前点击的节点数据
     * @param event 鼠标事件
     */
    const handleClick = (itemData: ITreeNode, event: MouseEvent) => {
      if (itemData.path) {
        emit('toggleCollapseContent', false, true);
        emit('handleClickMenu', itemData, event);
      }
    };

    /**
     * 渲染单个菜单项
     * @param itemData 树节点数据
     * @param level 当前级别
     * @param index 节点索引
     * @param width 菜单项宽度
     * @param maxWidth 菜单项最大宽度
     * @returns 渲染的菜单项 VNode
     */
    const renderMenuItem = (
      itemData: ITreeNode,
      level: number,
      index: number,
      width: number,
      maxWidth?: number
    ) => {
      const hasChildren = itemData.children && itemData.children.length > 0;
      return h(
        'div',
        {
          class: {
            'cascader-item': true,
            'virtually-tree-item-container--current': currentNode.value === itemData.key,
          },
          style: {
            maxWidth: `${maxWidth}px`,
          },
          ref: cascaderItemRef,
          onMouseenter: (event: MouseEvent) => handleMouseEnter(itemData, level, index, event),
          onClick: (event: MouseEvent) => handleClick(itemData, event),
        },
        [
          slots.icon?.({ node: itemData }),
          h(
            'div',
            {
              class: 'item-label',
              style: { width: `${width}px` },
              ref: cascaderItemLabelRef,
            },
            itemData.label
          ),
          hasChildren
            ? h('span', {
                class: [
                  'icon-plt-rig_Light',
                  {
                    'rotate-icon': hoveredPath.value.includes(itemData),
                  },
                ],
              })
            : null,
        ]
      );
    };

    /**
     * 渲染子菜单
     * @param itemData 树节点数据
     * @param level 当前级别
     * @returns 渲染的子菜单 VNode
     */
    const renderSubMenu = (itemData: ITreeNode, level: number) => {
      const { top, left, needOffsetParentId: parentId, curWidth } = calculatePosition(itemData);

      // 根据宽度判断是否需要下移
      const adjustedTop =
        parentId === itemData.children?.[0]?.parent?.id ? cascaderItemHeight.value : 0;

      const calculateMenu = calculateMenuPosition({
        parentTop: parentTop.value,
        relativeTop: top + adjustedTop,
        elementHeight: (itemData.children?.length || 0) * cascaderItemHeight.value,
      });

      // 提取最大宽度计算逻辑
      const availableWidth = document.body.clientWidth - left - 96; // 可用宽度
      const maxWidth = availableWidth > curWidth ? 9999 : availableWidth;

      return h(
        'div',
        {
          class: 'submenu',
          style: {
            top: `${calculateMenu.top}px`,
            left: `${left}px`,
            height: `${calculateMenu.maxHeight}px`,
          },
          key: itemData.key, // 增加唯一标识，确保子菜单重新渲染
        },
        h(
          PltVirtuallyList,
          {
            list: itemData.children,
            itemKey: 'key',
            minSize: cascaderItemHeight.value,
            style: {
              height: `${calculateMenu.maxHeight}px`,
              overflow: calculateMenu.needsScrollbar ? 'auto' : 'hidden',
            },
            ref: el => {
              virListRef.value = el; // 确保动态绑定时赋值
            },
          },
          {
            default: (slotProps: { itemData: ITreeNode; index: number }) => {
              const { itemData: child, index } = slotProps;
              return renderMenuItem(child, level + 1, index, curWidth, maxWidth);
            },
          }
        )
      );
    };

    onMounted(() => {
      if (cascaderItemRef.value) {
        // 在组件挂载后，获取 DOM 元素并初始化 getMaxTextWidth 函数
        const { getMaxTextWidth } = useTextWidth(cascaderItemLabelRef.value as HTMLElement);
        getMaxTextWidthRef.value = getMaxTextWidth;
      }
    });

    return () =>
      h(
        'div',
        {
          class: 'cascader-menu',
          onMouseleave: handleMouseLeave,
        },
        [
          h(
            PltVirtuallyList,
            {
              list: props.options,
              itemKey: 'key',
              minSize: cascaderItemHeight.value,
            },
            {
              default: ({ itemData, index }: { itemData: ITreeNode; index: number }) =>
                renderMenuItem(itemData, 0, index, menuWidth.value, 9999),
            }
          ),
          hoveredPath.value.map((parentItem, level) =>
            parentItem.children && parentItem.children.length > 0
              ? renderSubMenu(parentItem, level)
              : null
          ),
        ]
      );
  },
});
