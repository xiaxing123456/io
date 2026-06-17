import PltObserverItem from '../plt-observer-item/plt-observer-item';
import { useVirtuallyList } from './composables/use-virtually-list';
import type { EmitFunction } from '../../types/plt-virtually-list/plt-virtually-list';
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'PltVirtuallyList',
  props: {
    /** 列表数据 */
    list: {
      type: Array,
      default: () => [],
    },
    /** 数据key，用于唯一标识每个元素 */
    itemKey: {
      type: [String, Number],
      required: true,
    },
    /** 最小尺寸 */
    minSize: {
      type: Number,
      default: 20,
    },
    /** 是否为固定高度，可以提升性能 */
    fixed: {
      type: Boolean,
      default: false,
    },
    /** 超出可视区域额外渲染数 */
    buffer: {
      type: Number,
      default: 0,
    },
    /**  顶部buffer数量 */
    bufferTop: {
      type: Number,
      default: 0,
    },
    /**  底部buffer数量 */
    bufferBottom: {
      type: Number,
      default: 0,
    },
    /** 滚动距离阈值 */
    scrollDistance: {
      type: Number,
      default: 0,
    },
    /** 是否为水平移动 */
    horizontal: {
      type: Boolean,
      default: false,
    },
    /** 起始渲染下标 */
    start: {
      type: Number,
      default: 0,
    },
    /** 起始偏移量 */
    offset: {
      type: Number,
      default: 0,
    },
    /** 列表容器类名 */
    listClass: {
      type: String,
      default: 'virtually-menu-container',
    },
  },
  emits: ['scroll', 'toTop', 'toBottom', 'itemResize', 'rangeUpdate'],
  setup(props: any, { emit }) {
    /**
     * emitFunction 用于传递事件给父组件
     * 包括滚动、到顶、到底、item 尺寸变化、可视区域更新事件
     */
    const emitFunction: EmitFunction<any> = {
      scroll: evt => emit('scroll', evt),
      toTop: firstItem => emit('toTop', firstItem),
      toBottom: lastItem => emit('toBottom', lastItem),
      itemResize: (id, newSize) => emit('itemResize', id, newSize),
      rangeUpdate: (inViewBegin, inViewEnd) => emit('rangeUpdate', inViewBegin, inViewEnd),
    };

    return useVirtuallyList(props, emitFunction);
  },
  render() {
    const { renderList, reactiveData, resizeObserver } = this;
    const { itemKey, horizontal, listClass = '' } = this.props;
    const { listTotalSize, virtualSize, renderBegin } = reactiveData;

    // 渲染主列表
    const mainList = renderList.map((currentItem, index) =>
      h(
        PltObserverItem,
        {
          key: currentItem[itemKey], // 确保每个 item 有唯一 key
          id: currentItem[itemKey], // 用于 resizeObserver 观察
          fullPath: currentItem.fullPath, // 用于e2e测试
          resizeObserver, // 传递给 ObserverItem 的 resizeObserver
        },
        {
          default: () =>
            this.$slots.default?.({
              itemData: currentItem,
              index: renderBegin + index, // 计算虚拟列表中的实际下标
            }),
        }
      )
    );

    // 如果列表为空并且提供了空状态插槽，渲染空状态
    if (mainList.length === 0 && this.$slots.empty) {
      const height = this.slotSize.clientSize;
      mainList.push(
        h('div', { key: `slot-empty-${height}`, style: `height: ${height}px` }, [
          this.$slots.empty?.(),
        ])
      );
    }

    // 根据横向或纵向滚动生成不同的列表样式
    const dynamicListStyle = horizontal
      ? `will-change: width; min-width: ${listTotalSize}px; display: flex;`
      : `will-change: height; min-height: ${listTotalSize}px;`;

    const virtualStyle = horizontal
      ? `width: ${virtualSize}px; will-change: width;`
      : `height: ${virtualSize}px; will-change: height;`;

    return h(
      'div',
      {
        ref: 'pltVirtuallyListRef',
        class: 'plt-virtually-list__client',
        'data-id': 'client',
      },
      [
        h(
          'div',
          {
            ref: 'listRef', // 列表的可视区域容器
            class: listClass, // 自定义类名
            style: dynamicListStyle, // 动态样式
          },
          [h('div', { style: virtualStyle }), mainList] // 渲染虚拟列表内容
        ),
      ]
    );
  },
});
