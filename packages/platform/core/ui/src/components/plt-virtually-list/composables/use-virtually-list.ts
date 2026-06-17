import { DirectionEnum } from '../plt-virtually-list.enum';
import type {
  EmitFunction,
  ReactiveData,
  SlotSize,
  VirtListProps,
  VirtListReturn,
} from '../../../types/plt-virtually-list/plt-virtually-list';
import { useEventListener } from '@vueuse/core';
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowReactive,
  ShallowReactive,
  shallowRef,
  ShallowRef,
  watch,
} from 'vue';

const defaultProps = {
  fixed: false,
  buffer: 0,
  bufferTop: 0,
  bufferBottom: 0,
  scrollDistance: 0,
  horizontal: false,
  start: 0,
  offset: 0,
  listClass: '',
};

export const useVirtuallyList = <T extends Record<string, any>>(
  userProps: ShallowReactive<VirtListProps<T>>,
  emitFunction?: EmitFunction<T>
): VirtListReturn<T> => {
  /** 使用 Proxy 创建 props 对象，当访问 userProps 中不存在的属性时，返回 defaultProps 中的对应属性值 */
  const props = new Proxy(userProps, {
    get(target, key) {
      return Reflect.get(target, key) ?? Reflect.get(defaultProps, key);
    },
  }) as Required<VirtListProps<T>>;
  /** 最外层容器 */
  const pltVirtuallyListRef = ref<HTMLElement | null>(null);
  /** 内层实际高度容器 */
  const listRef = ref<Element | null>(null);
  /** 存储每个元素的尺寸信息 */
  const sizesMap = new Map();
  /** 用于强制重新渲染的 key，切换 renderKey 的值可以触发组件重新渲染 */
  const renderKey = ref(0);

  /** 滚动方向，'forward' 表示向前滚动，'backward' 表示向后滚动 */
  let direction: DirectionEnum = DirectionEnum.Backward;
  /** 一个手动设置滚动的标志位，用来判断是否需要纠正滚动位置 */
  let fixOffset = false;
  /** 强制修正滚动位置的标志位 */
  let forceFixOffset = false;
  /** 取消修正滚动位置的标志位 */
  let abortFixOffset = false;
  /** 存储修正滚动位置的任务函数 */
  let fixTaskFn: null | (() => void) = null;
  /** 根据 props.horizontal 判断滚动方向，并计算对应的滚动属性键 */
  /** 实际渲染列表数据 */
  const renderList: ShallowRef<T[]> = shallowRef([]);
  const directionKey = computed(() => (props.horizontal ? 'scrollLeft' : 'scrollTop'));
  const slotSize: ShallowReactive<SlotSize> = shallowReactive({
    clientSize: 0,
  });

  // 全局需要响应式的数据
  const reactiveData: ShallowReactive<ReactiveData> = shallowReactive({
    // 可视区域的个数，不算buffer，只和clientSize和minSize有关
    views: 0,
    // 滚动距离
    offset: 0,
    // 不包含插槽的高度
    listTotalSize: 0,
    // 虚拟占位尺寸，是从0到renderBegin的尺寸
    virtualSize: 0,
    // 可视区的起始下标
    inViewBegin: 0,
    // 可视区的结束下标
    inViewEnd: 0,
    // buffer的起始下标
    renderBegin: 0,
    // buffer的结束下标
    renderEnd: 0,
    // 顶部buffer数量
    bufferTop: 0,
    // 底部buffer数量
    bufferBottom: 0,
  });

  /**
   * 获取当前滚动条的位置
   */
  const getOffset = () =>
    pltVirtuallyListRef.value ? pltVirtuallyListRef.value[directionKey.value] : 0;

  /**
   * 获取当前所有元素高度
   */
  const getTotalSize = () => {
    return reactiveData.listTotalSize;
  };

  /**
   * 获取子节点最小高度
   * @param itemKey
   */
  const getItemSize = (itemKey: string) => {
    if (props.fixed) return props.minSize;
    return sizesMap.get(String(itemKey)) ?? props.minSize;
  };

  /**
   * 设置子节点高度
   * @param itemKey
   * @param size
   */
  const setItemSize = (itemKey: string, size: number) => {
    sizesMap.set(String(itemKey), size);
  };

  /**
   * 通过下标来获取元素位置信息
   * @param index
   */
  const getItemPosByIndex = (index: number) => {
    const { itemKey, minSize, list, fixed } = props;
    const current = getItemSize(list[index]?.[itemKey]);
    let topReduce = 0;

    if (fixed) {
      return {
        top: minSize * index,
        current: minSize,
        bottom: minSize * (index + 1),
      };
    }

    for (let i = 0; i < index; i++) {
      const currentSize = getItemSize(list[i]?.[itemKey]);
      topReduce += currentSize;
    }

    return {
      top: topReduce,
      current,
      bottom: topReduce + current,
    };
  };

  /**
   * 滚动元素到指定位置
   * @param offset
   */
  const scrollToOffset = (offset: number) => {
    abortFixOffset = true;
    setTimeout(() => {
      // console.log(pltVirtuallyListRef.value, offset, directionKey.value);
      if (pltVirtuallyListRef.value) pltVirtuallyListRef.value[directionKey.value] = offset;
    });
  };

  /**
   * 滚动到列表底部，并修正因精度问题导致的误差
   */
  const scrollToBottom = (): void => {
    // 首次滚动到底部
    scrollToOffset(getTotalSize());

    const precisionTolerance = 2; // 允许的精度误差
    const maxRetry = 10; // 最大重试次数，防止递归导致栈溢出
    let retryCount = 0;

    const correctScroll = () => {
      const totalSize = Math.round(getTotalSize());
      const currentOffset = Math.round(reactiveData.offset + slotSize.clientSize);

      // 检查当前偏移量与总大小的差距是否在允许的误差范围内
      if (Math.abs(currentOffset - totalSize) > precisionTolerance && retryCount < maxRetry) {
        retryCount++;
        scrollToOffset(totalSize); // 再次尝试滚动到底部
        setTimeout(correctScroll, 3); // 3毫秒后重试
      }
    };

    setTimeout(correctScroll, 3);
  };

  /**
   * 滚动到指定索引位置，并根据需要修正偏移量
   * @param {number} index - 目标项的索引
   */
  const scrollToIndex = (index: number): void => {
    // 如果索引无效，直接返回
    if (index < 0) return;

    // // 如果索引超出列表长度，直接滚动到底部
    // if (index >= props.list.length - 1) {
    //     scrollToBottom();
    //     return;
    // }

    // 获取初始的目标项位置偏移量
    let { top: lastOffset } = getItemPosByIndex(index);
    scrollToOffset(lastOffset); // 滚动到初始位置

    /**
     * 修正滚动偏移量的函数，确保正确显示
     */
    const fixToIndex = (): void => {
      const { top: currentOffset } = getItemPosByIndex(index); // 获取最新偏移量

      // 如果偏移量有变化，继续修正
      if (lastOffset !== currentOffset) {
        lastOffset = currentOffset; // 更新偏移量
        scrollToOffset(currentOffset); // 滚动到新的偏移量
        fixTaskFn = fixToIndex; // 保留修正任务
      } else {
        fixTaskFn = null; // 如果偏移量不再变化，取消修正任务
      }
    };

    // 启动修正任务
    fixTaskFn = fixToIndex;
  };

  /**
   * 滚动到可视区域
   * @param index
   */
  const scrollIntoView = (index: number) => {
    const { top: targetMin, bottom: targetMax } = getItemPosByIndex(index);
    const offsetMin = getOffset();
    const offsetMax = offsetMin + slotSize.clientSize;
    const currentSize = getItemSize(props.list[index]?.[props.itemKey]);
    if (targetMin < offsetMin && offsetMin < targetMax && currentSize < slotSize.clientSize) {
      // 如果目标元素上方看不到，底部看得到，那么滚动到顶部看得到就行了
      scrollToOffset(targetMin);
      return;
    }
    if (targetMin < offsetMax && offsetMax < targetMax && currentSize < slotSize.clientSize) {
      // 如果目标元素上方看得到，底部看不到，那么滚动到底部看得到就行了
      scrollToOffset(targetMax - slotSize.clientSize);
      return;
    }

    // 屏幕下方
    if (targetMin >= offsetMax) {
      setTimeout(() => {
        // 使节点处于可见区域中间偏上位置
        scrollToOffset(targetMin - slotSize.clientSize / 3);
      });
      return;
    }

    // 屏幕上方
    if (targetMax <= offsetMin) {
      scrollToIndex(index);
    }

    // 在中间就不动了
  };

  /**
   * 滚动到顶部
   */
  const scrollToTop = () => {
    scrollToOffset(0);

    setTimeout(() => {
      // 因为纠正滚动条会有误差，所以这里需要再次纠正
      if (pltVirtuallyListRef?.value?.[directionKey.value] !== 0) {
        scrollToTop();
      }
    }, 50);
  };

  /**
   * 计算起始结束位置
   * @param start
   */
  const updateRange = (start: number) => {
    reactiveData.inViewBegin = start;
    reactiveData.inViewEnd = Math.min(start + reactiveData.views, props.list.length - 1);

    // expose
    emitFunction?.rangeUpdate?.(reactiveData.inViewBegin, reactiveData.inViewEnd);
  };

  /**
   * 获取当前索引范围内的所有元素的高度
   * @param range1
   * @param range2
   */
  const getRangeSize = (range1: number, range2: number) => {
    const start = Math.min(range1, range2);
    const end = Math.max(range1, range2);
    const { list, itemKey } = props;

    let totalSize = 0;
    for (let i = start; i < end; i++) {
      totalSize += getItemSize(list[i]?.[itemKey]);
    }
    return totalSize;
  };

  /**
   * 获取当前滚动条的偏移量
   */
  const getVirtualSize2beginInView = () => {
    return (
      reactiveData.virtualSize + getRangeSize(reactiveData.renderBegin, reactiveData.inViewBegin)
    );
  };

  /**
   * 计算当前视图范围并更新节点索引
   */
  const calcRange = () => {
    const { offset, inViewBegin } = reactiveData;
    const { itemKey, list } = props;

    let start = inViewBegin;
    let offsetReduce = getVirtualSize2beginInView();

    // 快速滚动到顶部时，若offset小于0，直接修正为0并返回
    if (offset < 0) {
      updateRange(0);
      return;
    }

    if (direction === DirectionEnum.Forward) {
      // 1. 没发生变化
      if (offset >= offsetReduce) {
        return;
      }
      for (let i = start - 1; i >= 0; i--) {
        // 2. 变化了
        const currentSize = getItemSize(list[i]?.[itemKey]);
        offsetReduce -= currentSize;
        if (offsetReduce <= offset && offset < offsetReduce + currentSize) {
          start = i;
          // console.log(`👆🏻👆🏻👆🏻👆🏻 for break 变了 start ${start}`);
          break;
        }
      }

      // 向上滚动需要修正
      fixOffset = true;
    }

    if (direction === DirectionEnum.Backward) {
      if (offset <= offsetReduce) {
        return;
      }
      for (let i = start; i < list.length; i++) {
        // 2. 变化了
        const currentSize = getItemSize(list[i]?.[itemKey]);

        if (offsetReduce <= offset && offset < offsetReduce + currentSize) {
          start = i;
          break;
        }
        offsetReduce += currentSize;
      }

      // 向下滚动不需要修正
      fixOffset = false;
    }

    // 节流
    if (start !== reactiveData.inViewBegin) {
      updateRange(start);
    }
  };

  /**
   * 滚动事件
   * @param evt
   */
  const onScroll = (evt: Event) => {
    // 触发滚动事件的回调
    emitFunction?.scroll?.(evt);

    const offset = getOffset();
    const { list, scrollDistance } = props;

    // 如果偏移量没有变化，则不做任何处理
    if (offset === reactiveData.offset) return;

    // 根据偏移量更新滚动方向
    direction = offset < reactiveData.offset ? DirectionEnum.Forward : DirectionEnum.Backward;
    reactiveData.offset = offset;

    calcRange();

    // 到达顶部
    if (direction === DirectionEnum.Forward && reactiveData.offset <= scrollDistance) {
      // console.log('[VirtList] 到达顶部');
      emitFunction?.toTop?.(list[0]);
    }
    // 到达底部 - 放在这里是为了渲染完成拿到真是高度了，再判断是否是真的到达底部
    // 使用一个 Math.round 来解决小数点的误差问题
    if (
      direction === DirectionEnum.Backward &&
      Math.round(reactiveData.offset + scrollDistance) >=
        Math.round(reactiveData.listTotalSize - slotSize.clientSize)
    ) {
      // console.log('[VirtList] 到达底部');
      emitFunction?.toBottom?.(list[list.length - 1]);
    }
  };

  /**
   * 计算所有可视区域的个数
   */
  const calcViews = () => {
    // 不算buffer的个数
    reactiveData.views = Math.ceil(slotSize.clientSize / props.minSize) + 1;
  };

  /**
   * 可视区域尺寸变化
   */
  const onClientResize = () => {
    // 可视区域尺寸变化 => 1. 更新可视区域个数 2. 可视区域个数变化后需要及时更新记录尺寸
    calcViews();
    updateRange(reactiveData.inViewBegin);
  };

  /**
   * 计算列表的总大小
   */
  const calcListTotalSize = (): void => {
    const { fixed, minSize, list, itemKey } = props;

    // 如果是固定大小的列表，直接使用固定项高度乘以列表长度
    if (fixed) {
      reactiveData.listTotalSize = minSize * list.length;
      return;
    }

    // 非固定大小的列表，逐项累加计算总高度
    reactiveData.listTotalSize = list.reduce((totalSize, item) => {
      const itemSize = getItemSize(item?.[itemKey]);
      return totalSize + itemSize;
    }, 0);
  };

  /**
   * 主要用于视图更新数据
   */
  const forceUpdate = () => {
    renderKey.value += 1;
  };

  /**
   * 重置虚拟列表的状态，并强制更新视图
   */
  const reset = (): void => {
    // 初始化虚拟列表相关数据
    const initialState = {
      offset: 0,
      listTotalSize: 0,
      virtualSize: 0,
      inViewBegin: 0,
      inViewEnd: 0,
      renderBegin: 0,
      renderEnd: 0,
    };

    // 重置 reactiveData 中的各个属性
    Object.assign(reactiveData, initialState);

    // 清空尺寸缓存映射
    sizesMap.clear();

    // 强制触发重新渲染，确保列表内容正确更新
    forceUpdate();
  };

  let resizeObserver: ResizeObserver | undefined;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(entries => {
      // todo 这里加了requestIdleCallback会有问题
      // 延迟执行，快速滚动的时候是没有必要的
      // requestIdleCallback(() => {
      let diff = 0;
      entries.forEach(entry => {
        const { id } = (entry.target as HTMLElement).dataset;

        if (!id) return;

        const oldSize = getItemSize(id);
        let newSize = 0;
        if (entry.borderBoxSize) {
          const borderBoxSize = Array.isArray(entry.borderBoxSize)
            ? entry.borderBoxSize[0]
            : entry.borderBoxSize;
          newSize = props.horizontal ? borderBoxSize.inlineSize : borderBoxSize.blockSize;
        } else {
          newSize = props.horizontal ? entry.contentRect.width : entry.contentRect.height;
        }

        if (id === 'client') {
          slotSize.clientSize = newSize;
          onClientResize();
        } else if (oldSize !== newSize) {
          setItemSize(id, newSize);
          diff += newSize - oldSize;
          emitFunction?.itemResize?.(id, newSize);
        }
      });

      reactiveData.listTotalSize += diff;

      // 如果有需要修正的方法进行修正
      fixTaskFn?.();
      // console.log(fixOffset, forceFixOffset, diff);
      // 向上滚动纠正误差 - 当没有顶部buffer的时候是需要的
      if ((fixOffset || forceFixOffset) && diff !== 0 && !abortFixOffset) {
        fixOffset = false;
        forceFixOffset = false;
        scrollToOffset(reactiveData.offset + diff);
        // console.log('纠正误差', reactiveData.offset, diff);
      }
      abortFixOffset = false;
    });
  }

  /**
   * 计算从第0个到currentFirst的总高度
   */
  const updateTotalVirtualSize = () => {
    let offset = 0;
    const currentFirst = reactiveData.renderBegin;
    for (let i = 0; i < currentFirst; i++) {
      offset += getItemSize(props.list[i]?.[props.itemKey]);
    }
    reactiveData.virtualSize = offset;
  };

  // 在组件挂载之前执行一些初始设置
  onBeforeMount(() => {
    // 初始化顶部和底部缓冲区大小，优先使用具体的 top/bottom 值，否则使用默认缓冲区大小
    reactiveData.bufferTop = props.bufferTop || props.buffer;
    reactiveData.bufferBottom = props.bufferBottom || props.buffer;
  });

  onMounted(() => {
    if (pltVirtuallyListRef.value) {
      useEventListener(pltVirtuallyListRef.value, 'scroll', onScroll);

      resizeObserver?.observe(pltVirtuallyListRef.value as Element);
      slotSize.clientSize = slotSize.clientSize || pltVirtuallyListRef.value?.offsetHeight;
    }

    if (props.start) {
      scrollToIndex(props.start);
    } else if (props.offset) {
      scrollToOffset(props.offset);
    }
  });

  onBeforeUnmount(() => {
    if (pltVirtuallyListRef.value) {
      resizeObserver?.unobserve(pltVirtuallyListRef.value as Element);
      slotSize.clientSize = 0;
    }
  });

  /**
   * 手动更新渲染范围的方法
   * @param newRenderBegin
   * @param newRenderEnd
   */
  const manualRender = (newRenderBegin: number, newRenderEnd: number) => {
    // 保存旧的渲染起始点，用于后续计算
    const oldRenderBegin = reactiveData.renderBegin;

    // update render begin
    reactiveData.renderBegin = newRenderBegin;
    // update render end
    reactiveData.renderEnd = newRenderEnd;
    // update virtualSize, diff range size
    if (newRenderBegin > oldRenderBegin) {
      reactiveData.virtualSize += getRangeSize(newRenderBegin, oldRenderBegin);
    } else {
      reactiveData.virtualSize -= getRangeSize(newRenderBegin, oldRenderBegin);
    }
    // update render list
    renderList.value = props.list.slice(reactiveData.renderBegin, reactiveData.renderEnd + 1);
    // update size
    updateTotalVirtualSize();
  };

  watch(
    // 这里为什么用 renderKey 代替监听 props.list
    // 因为props.list会导致v-for时deepArray导致大量的性能浪费
    () => [reactiveData.inViewBegin, reactiveData.inViewEnd, renderKey.value],
    (newVal, oldVal) => {
      if (newVal && oldVal) {
        // console.log('watch', newVal, oldVal);
        const [newInViewBegin] = newVal;

        // 新的渲染起始
        let newRenderBegin = newInViewBegin;
        // 新的渲染结束
        let newRenderEnd = reactiveData.inViewEnd;
        // 计算buffer
        newRenderBegin = Math.max(0, newRenderBegin - reactiveData.bufferTop);
        newRenderEnd = Math.min(
          newRenderEnd + reactiveData.bufferBottom,
          Math.max(props.list.length - 1, 0)
        );

        manualRender(newRenderBegin, newRenderEnd);
        // console.log('==============')
        // console.log(renderList)
      }
    },
    {
      immediate: true,
    }
  );

  watch(
    () => props.list.length,
    () => {
      // 如果数据为空，那么就重置
      if (props.list.length <= 0) {
        reset();
        return;
      }

      // [require] 因为list长度变化，所以总高度有变化
      calcListTotalSize();
      // [require] 因为list长度变化，所以重新计算起始结束位置
      updateRange(reactiveData.inViewBegin);
      // [require] 如果顶部列表数据发生变更需要更正顶部高度
      updateTotalVirtualSize();
      // [require] 列表长度切内容发生变化，如果起始位置没变，则需要强制更新一下页面
      forceUpdate();
    },
    {
      immediate: true,
    }
  );

  return {
    props,
    renderList,
    pltVirtuallyListRef,
    listRef,
    reactiveData,
    slotSize,
    sizesMap,
    resizeObserver,
    getOffset,
    reset,
    scrollToIndex,
    manualRender,
    scrollIntoView,
    scrollToTop,
    scrollToBottom,
    scrollToOffset,
    getItemSize,
    getItemPosByIndex,
    forceUpdate,
  };
};
