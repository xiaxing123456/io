import PltVirtuallyList from '../plt-virtually-list/plt-virtually-list';
import CascaderMenu from './src/components/cascader-menu';
import MenuNode from './src/components/virtually-menu-node';
import { treeProps, type TreeProps, useTree } from './src/composables/use-tree';
import './src/style/index.scss';
import type { ITreeNode } from '../../types/plt-menu/plt-menu';
import { calculateMenuPosition } from './src/util';
import { defineComponent, h, Teleport, Transition } from 'vue';

export default defineComponent({
  name: 'PltMenu',
  props: treeProps,
  setup(props: TreeProps, { emit, slots }) {
    // 解构树相关逻辑
    const tree = useTree(props, emit);

    /**
     * 计算折叠内容的样式
     *
     * @param {DOMRect} position - 当前元素的位置信息
     * @param {ITreeNode[]} options - 折叠菜单的选项
     * @returns  - 计算后的样式对象
     */
    const getCollapseContentStyle = (position: DOMRect, options: ITreeNode[]) => {
      const { top, height, left } = position || {};
      // 从 CSS 变量获取菜单项高度
      const cascaderItemHeight =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--plt-menu-row-height'),
          10
        ) || 42;
      const calculateMenu = calculateMenuPosition({
        parentTop: 0,
        relativeTop: top,
        elementHeight: options?.length * cascaderItemHeight,
      });
      // 如果没有子级选项，调整 top 值（tooltip需要居中显示）
      calculateMenu.top = options?.length ? calculateMenu?.top : calculateMenu?.top + height / 2;

      // 只有需要滚动条时才设置固定高度，避免内容不足时出现多余空白
      return {
        top: `${calculateMenu?.top}px`,
        left: `${left}px`,
        ...(calculateMenu.needsScrollbar ? { height: `${calculateMenu.maxHeight}px` } : {}),
        position: 'absolute',
      };
    };

    /**
     * 创建插槽渲染器
     *
     * @param {string} slotType - 插槽类型 (如 'icon', 'default', 'content')
     * @returns - 渲染插槽的函数，如果不存在插槽则返回 null
     */
    const createSlotRenderer = (slotType: string) => {
      return slots[slotType]
        ? (node: ITreeNode, ...args: any[]) => slots[slotType]?.({ node, ...args })
        : null;
    };

    return {
      ...tree,
      props,
      slots,
      createSlotRenderer,
      getCollapseContentStyle,
    };
  },
  render() {
    const {
      flattenList,
      collapse,
      position,
      options,
      isShowCollapseContent,
      currentNode,
      getCollapseContentStyle,
      createSlotRenderer,
      toggleCollapseContent,
      onClickTreeNode,
      isExpanded,
      onScroll,
      isCurrent,
      isCollapseCurrent,
      toggleExpand,
      isForceHiddenExpandIcon,
      onMouseenter,
    } = this;

    const { minSize, indent, keyword } = this.$props as TreeProps;
    /**
     * 渲染单个树节点
     *
     * @param {Object} param - 包含 itemData 和 index 的对象
     * @returns - 渲染的树节点组件
     */
    const renderTreeNode = ({ itemData }: { itemData: ITreeNode; index: number }) => {
      const nodeProps = {
        node: itemData,
        indent,
        keyword,
        collapse,
        hiddenExpandIcon: isForceHiddenExpandIcon(itemData),
        expanded: isExpanded(itemData),
        current: isCurrent(itemData),
        collapseCurrent: isCollapseCurrent(itemData),
        onClick: onClickTreeNode,
        onToggle: toggleExpand,
        onMouseenter,
      };

      const renderSlots = {
        icon: createSlotRenderer('icon'),
        default: createSlotRenderer('default'),
        content: createSlotRenderer('content'),
      };

      return h(MenuNode, nodeProps, renderSlots);
    };

    /**
     * 渲染折叠内容
     *
     * @returns - 渲染的折叠菜单或 null
     */
    const renderCollapseContent = () => {
      if (!collapse) return null;
      const style = getCollapseContentStyle(position, options);
      return h(
        Transition,
        {
          name: 'collapse-fade',
        },
        () => {
          if (!isShowCollapseContent || !options?.length) return null;

          return h(
            'div',
            { class: 'collapse-animation', style },
            h(
              CascaderMenu,
              {
                options,
                currentNode,
                parentTop: parseInt(style?.top, 10),
                onHandleClickMenu: onClickTreeNode,
                onToggleCollapseContent: toggleCollapseContent,
              },
              {
                icon: this.slots.icon,
              }
            )
          );
        }
      );
    };

    // 渲染虚拟列表
    return [
      h(
        'div',
        {
          class: ['plt-menu', { 'menu-collapse': collapse }],
        },
        [
          h(
            PltVirtuallyList,
            {
              ref: 'virListRef',
              ...this.$attrs,
              list: flattenList,
              minSize,
              itemKey: 'key',
              onScroll,
            },
            {
              default: renderTreeNode,
              empty: this.slots.empty,
            }
          ),
        ]
      ),
      h(Teleport, { to: 'body' }, [renderCollapseContent()]),
    ];
  },
});
