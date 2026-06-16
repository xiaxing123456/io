import { defineComponent, h, PropType, VNode } from 'vue';
import {
  findNodeByClass,
  highlightTextInNode,
  replaceVNodeByClass,
} from '../../../plt-tree/helper';
import type { ITreeNode } from '../type';

// 定义 treeNodeProps 属性，用于接收树节点相关的配置信息
export const treeNodeProps = {
  /** 节点数据，ITreeNode 定义了节点的结构 */
  node: {
    type: Object as PropType<ITreeNode>,
    required: true,
    default: () => ({}),
  },
  /** 节点是否展开 */
  expanded: {
    type: Boolean,
    default: false,
  },
  /** 当前节点是否选中 */
  current: {
    type: Boolean,
    default: false,
  },
  /** 节点缩进值，用于控制节点的层级缩进 */
  indent: {
    type: Number,
    required: true,
    default: 16,
  },
  /** 是否隐藏展开图标 */
  hiddenExpandIcon: {
    type: Boolean,
    default: false,
  },
  /** 是否折叠菜单，控制是否渲染内容 */
  collapse: {
    type: Boolean,
    default: false,
  },
  /** 处于折叠状态下的选中节点的祖先节点是否选中 */
  collapseCurrent: {
    type: Boolean,
    default: false,
  },
  /** 搜索关键字，用于高亮显示 */
  keyword: {
    type: String,
    default: '',
  },
};

export default defineComponent({
  name: 'VirtueMenuNode',
  props: treeNodeProps,
  emits: ['click', 'toggle', 'mouseenter', 'mouseleave'], // 组件可以触发的事件
  setup(props, { emit, slots }) {
    /**
     * 通用事件处理器，用于处理节点的点击、切换和鼠标事件
     * @param eventName - 事件类型
     * @param e - 事件对象
     * @param node - 当前树节点
     */
    const handleEvent = (
      eventName: 'click' | 'toggle' | 'mouseenter' | 'mouseleave',
      e: Event,
      node: ITreeNode
    ) => {
      e.stopPropagation(); // 阻止事件冒泡
      emit(eventName, node, e); // 触发对应的事件，向父组件传递
    };

    // 各事件处理函数
    const handleClick = (e: Event) => handleEvent('click', e, props.node);
    const handleToggle = (e: Event) => handleEvent('toggle', e, props.node);
    const handleMouseenter = (e: Event) => {
      if (props.collapse) handleEvent('mouseenter', e, props.node);
    };
    const handleMouseleave = (e: Event) => {
      if (props.collapse) handleEvent('mouseleave', e, props.node);
    };

    return {
      slots, // 用于插槽的渲染
      handleClick, // 点击事件处理
      handleToggle, // 切换展开状态事件处理
      handleMouseenter, // 鼠标移入事件处理
      handleMouseleave, // 鼠标移出事件处理
    };
  },
  render() {
    const { handleClick, handleToggle, handleMouseenter, handleMouseleave } = this;
    const {
      current,
      indent,
      expanded,
      node,
      hiddenExpandIcon,
      collapse,
      collapseCurrent,
      keyword,
    } = this.$props;

    /**
     * 渲染节点内容，使用插槽内容或默认节点文本
     */
    const renderContent = () => {
      // 获取插槽内容
      const slotContent = this.slots.content?.(node);

      // 如果插槽内容存在并且是数组，处理第一个层级的子节点
      const processedSlotContent =
        slotContent && Array.isArray(slotContent) && keyword
          ? slotContent.map((child, index) => {
              // 仅处理第一个层级的子节点
              if (index === 0 && child?.children && Array.isArray(child.children)) {
                const updatedChildren = child.children.map(grandChild => {
                  const targetNode = findNodeByClass([grandChild as any], 'menu-text');
                  if (targetNode) {
                    targetNode.children = replaceVNodeByClass(
                      targetNode.children as VNode[],
                      '',
                      menuNode => highlightTextInNode(menuNode, keyword)
                    );
                    return targetNode;
                  }
                  return grandChild; // 原样返回未修改的节点
                });

                // 返回更新后的节点，保留顶层结构和属性
                return {
                  ...child,
                  children: updatedChildren,
                };
              }
              return child; // 其他层级保持不变
            })
          : slotContent;

      // 渲染内容
      return processedSlotContent?.length
        ? h(
            'div',
            {
              class: 'virtually-tree-node-content oth',
            },
            processedSlotContent
          )
        : h('div', { class: 'virtually-tree-node-content' }, node.label);
    };

    /**
     * 渲染展开图标，如果节点是叶子节点或者配置隐藏图标，则不显示
     */
    const renderExpandIcon = () => {
      if (node.isLeaf || hiddenExpandIcon || collapse) return null;

      return h('div', {
        class: [
          'virtually-tree-icon',
          { 'virtually-tree-icon--expanded': expanded },
          'icon-plt-uivv_Light',
        ],
        onClick: handleToggle, // 切换展开状态
      });
    };

    /**
     * 渲染图标插槽，用于自定义节点前的图标
     */
    const renderIcon = () => this.slots.icon?.(node, expanded);

    /**
     * 计算节点的缩进样式，根据节点的层级 level 来决定左侧的缩进
     */
    const containerStyle = { paddingLeft: `${(node.level - 1) * indent}px` };

    /**
     * 渲染默认的节点结构，包括图标、内容和展开图标
     */
    const renderDefault = () =>
      h(
        'div',
        {
          class: {
            'virtually-tree-item-container': true, // 基本样式
            'virtually-tree-item-container-collapse': collapse, // 折叠样式'
          },
          style: containerStyle, // 动态缩进样式
        },
        [renderIcon(), renderContent(), renderExpandIcon()] // 渲染图标、内容和展开图标
      );

    // 根节点渲染
    return h(
      'div',
      {
        onClick: handleClick, // 节点点击事件
        onMouseenter: handleMouseenter, // 鼠标移入事件
        onMouseleave: handleMouseleave, // 鼠标移出事件
        class: {
          'virtually-menu-item': true, // 根节点样式
          'virtually-tree-item-container--current': current, // 当前选中节点样式
          'virtually-tree-collapse-item-container--current': collapseCurrent, // 折叠时如果子孙节点有做选中，那么其根节点也需要显示选中样式
        },
      },
      renderDefault() // 渲染默认节点结构
    );
  },
});
