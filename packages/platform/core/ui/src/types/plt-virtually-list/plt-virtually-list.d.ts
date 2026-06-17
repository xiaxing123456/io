import type { Ref, ShallowReactive } from 'vue';

interface BaseListProps<T extends Record<string, string>> {
  /** 列表数据项数组 */
  list: T[];
  /** 列表项的唯一标识符字段名 */
  itemKey: string | number;
  /** 最小可见项的高度 */
  minSize: number;
  /** 滚动距离，用于自定义滚动行为（可选） */
  scrollDistance?: number;
}

export interface VirtListProps<T extends Record<string, string>> extends BaseListProps<T> {
  /** 是否固定列表的尺寸（默认为 false） */
  fixed?: boolean;
  /** 缓冲区大小，用于提前渲染列表项（默认为 0） */
  buffer?: number;
  /** 是否为水平滚动（默认为 false） */
  horizontal?: boolean;
  /** 列表的起始位置（默认为 0） */
  start?: number;
  /** 列表的滚动偏移量（默认为 0） */
  offset?: number;
  /** 列表的自定义类名 */
  listClass?: string;
  /**  顶部buffer数量 */
  bufferTop: number;
  /**  底部buffer数量 */
  bufferBottom: number;
}

export interface EmitFunction<T> {
  /** 滚动事件 */
  scroll?: (e: Event) => void;
  /** 滚动到顶部事件 */
  toTop?: (item: T) => void;
  /** 滚动到底部事件 */
  toBottom?: (item: T) => void;
  /** 节点尺寸变化事件 */
  itemResize?: (id: string, newSize: number) => void;
  /** 范围更新事件 */
  rangeUpdate?: (begin: number, end: number) => void;
}

export type ReactiveData = {
  /** 当前可视区域能容纳的节点数，不含 buffer */
  views: number;
  /** 当前滚动距离 */
  offset: number;
  /** 列表总尺寸 */
  listTotalSize: number;
  /** renderBegin 前面的虚拟占位尺寸 */
  virtualSize: number;
  /** 可视区起始下标 */
  inViewBegin: number;
  /** 可视区结束下标 */
  inViewEnd: number;
  /** 实际渲染起始下标，包含顶部 buffer */
  renderBegin: number;
  /** 实际渲染结束下标，包含底部 buffer */
  renderEnd: number;
  /** 顶部 buffer 数量 */
  bufferTop: number;
  /** 底部 buffer 数量 */
  bufferBottom: number;
};

export type SlotSize = {
  clientSize: number;
};

export type VirtListReturn<T extends Record<string, string>> = {
  /** 虚拟列表属性 */
  props: Required<VirtListProps<T>>;
  /** 渲染列表 */
  renderList: Ref<T[]>;
  /** 容器元素引用 */
  pltVirtuallyListRef: any;
  /** 列表元素引用 */
  listRef: any;
  /** 响应式数据 */
  reactiveData: ShallowReactive<ReactiveData>;
  /** 插槽大小 */
  slotSize: ShallowReactive<SlotSize>;
  /** 节点尺寸映射 */
  sizesMap: Map<string, number>;
  /** 节点观察器 */
  resizeObserver: ResizeObserver | undefined;
  /** 获取当前滚动偏移量 */
  getOffset: () => number;
  /** 重置虚拟列表 */
  reset: () => void;
  /** 滚动到指定索引 */
  scrollToIndex: (index: number) => void;
  /** 滚动到指定项 */
  scrollIntoView: (index: number) => void;
  /** 滚动到顶部 */
  scrollToTop: () => void;
  /** 手动渲染指定范围的列表项 */
  manualRender: (begin: number, end: number) => void;
  /** 滚动到底部 */
  scrollToBottom: () => void;
  /** 滚动到指定偏移量 */
  scrollToOffset: (offset: number) => void;
  /** 获取指定项的尺寸 */
  getItemSize: (itemKey: string) => number;
  /** 获取指定索引的项的位置 */
  getItemPosByIndex: (index: number) => {
    top: number;
    current: number;
    bottom: number;
  };
  /** 强制更新虚拟列表 */
  forceUpdate: () => void;
};
