import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { Pane, Splitpanes } from 'splitpanes';
import type {
  PaneData,
  SplitpanesReadyPayload,
  SplitpanesResizePayload,
  SplitpanesResizedPayload,
} from 'splitpanes';
import type {
  PltMobileContainerOrientation,
  PltMobileContainerPaneConfig,
  PltMobileContainerPaneSizeInfo,
  PltMobileContainerProps,
  PltMobileContainerResizePayload,
  PltMobileContainerResizedPayload,
  PltMobileContainerSize,
  PltMobileContainerSlotScope,
} from './plt-mobile-container.type';
import 'splitpanes/dist/splitpanes.css';
import './plt-mobile-container.scss';

const DEFAULT_LEFT_SIZE_PERCENT = 30;
const PERCENT_PRECISION = 0.0001;

export interface ResolvedPaneConfig extends PltMobileContainerPaneConfig {
  class?: unknown;
  style?: unknown;
  legacySlot?: 'left' | 'preview';
}

export interface ResolvedPane {
  key: string | number;
  config: ResolvedPaneConfig;
  class?: unknown;
  style?: unknown;
  attrs?: Record<string, unknown>;
  size?: number;
  minSize?: number;
  maxSize?: number;
}

interface PanePercentConfig {
  size?: number;
  minSize: number;
  maxSize: number;
  flex: number;
  isAuto: boolean;
}

const clampPercent = (value: number, min = 0, max = 100) => {
  return Math.min(max, Math.max(min, value));
};

const roundNumber = (value: number) => {
  return Math.round(value * 10000) / 10000;
};

const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

const hasValue = (value: unknown) => {
  return value !== undefined && value !== null && value !== '';
};

const parseSize = (value?: PltMobileContainerSize) => {
  if (!hasValue(value)) return undefined;

  if (isValidNumber(value)) {
    return { type: 'px' as const, value };
  }

  const stringValue = `${value}`.trim();
  if (!stringValue) return undefined;

  if (stringValue.endsWith('%')) {
    const percent = parseFloat(stringValue);
    return Number.isFinite(percent) ? { type: 'percent' as const, value: percent } : undefined;
  }

  if (stringValue.endsWith('px')) {
    const px = parseFloat(stringValue);
    return Number.isFinite(px) ? { type: 'px' as const, value: px } : undefined;
  }

  if (stringValue.endsWith('rem')) {
    const rem = parseFloat(stringValue);
    const rootFontSize =
      typeof document === 'undefined'
        ? 16
        : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return Number.isFinite(rem) ? { type: 'px' as const, value: rem * rootFontSize } : undefined;
  }

  const px = parseFloat(stringValue);
  return Number.isFinite(px) ? { type: 'px' as const, value: px } : undefined;
};

const distributePercent = (
  sizes: number[],
  configs: PanePercentConfig[],
  targetIndexes: number[],
  amount: number,
  direction: 'grow' | 'shrink'
) => {
  let remaining = Math.max(0, amount);
  let indexes = [...targetIndexes];

  while (remaining > PERCENT_PRECISION && indexes.length) {
    const totalFlex = indexes.reduce((total, index) => total + configs[index].flex, 0);
    const defaultFlex = totalFlex > 0 ? 0 : 1;
    let used = 0;
    const nextIndexes: number[] = [];

    indexes.forEach(index => {
      const config = configs[index];
      const flex = totalFlex > 0 ? config.flex : defaultFlex;
      if (flex <= 0) return;

      const capacity =
        direction === 'grow'
          ? config.maxSize - sizes[index]
          : sizes[index] - config.minSize;

      if (capacity <= PERCENT_PRECISION) return;

      const share = (remaining * flex) / (totalFlex || indexes.length);
      const delta = Math.min(share, capacity);
      sizes[index] += direction === 'grow' ? delta : -delta;
      used += delta;

      if (capacity - delta > PERCENT_PRECISION) {
        nextIndexes.push(index);
      }
    });

    if (used <= PERCENT_PRECISION) break;

    remaining -= used;
    indexes = nextIndexes;
  }
};

const resolvePaneSizes = (configs: PanePercentConfig[]) => {
  const sizes = configs.map(config => {
    const initialSize = config.isAuto ? config.minSize : config.size || config.minSize;
    return clampPercent(initialSize, config.minSize, config.maxSize);
  });

  const autoIndexes = configs
    .map((config, index) => (config.isAuto ? index : -1))
    .filter(index => index > -1);
  const explicitIndexes = configs
    .map((config, index) => (!config.isAuto ? index : -1))
    .filter(index => index > -1);

  let totalSize = sizes.reduce((total, size) => total + size, 0);

  if (totalSize < 100) {
    const remaining = 100 - totalSize;
    distributePercent(sizes, configs, autoIndexes, remaining, 'grow');

    totalSize = sizes.reduce((total, size) => total + size, 0);
    if (totalSize < 100) {
      distributePercent(
        sizes,
        configs,
        [...autoIndexes, ...explicitIndexes],
        100 - totalSize,
        'grow'
      );
    }
  }

  totalSize = sizes.reduce((total, size) => total + size, 0);
  if (totalSize > 100) {
    distributePercent(sizes, configs, explicitIndexes, totalSize - 100, 'shrink');

    totalSize = sizes.reduce((total, size) => total + size, 0);
    if (totalSize > 100) {
      distributePercent(
        sizes,
        configs,
        [...explicitIndexes, ...autoIndexes],
        totalSize - 100,
        'shrink'
      );
    }
  }

  return sizes.map(size => roundNumber(clampPercent(size)));
};

export default defineComponent({
  name: 'PltMobileContainer',
  props: {
    /** 面板配置数据 */
    data: {
      type: Array as PropType<PltMobileContainerPaneConfig[]>,
      default: undefined,
    },
    /** 布局方向 */
    orientation: {
      type: String as PropType<PltMobileContainerOrientation>,
      default: undefined,
    },
    /** splitpanes 自定义类名 */
    splitpanesClass: {
      type: [String, Object, Array] as PropType<unknown>,
      default: undefined,
    },
    /** splitpanes 自定义样式 */
    splitpanesStyle: {
      type: [String, Object, Array] as PropType<unknown>,
      default: undefined,
    },
    /** 是否 RTL */
    rtl: {
      type: Boolean,
      default: false,
    },
    /** 是否展示首个分割条 */
    firstSplitter: {
      type: Boolean,
      default: false,
    },
    /** 左侧默认宽度 */
    leftDefaultWidth: {
      type: Number,
      default: 400,
    },
    /** 左侧最小宽度 */
    leftMinWidth: {
      type: Number,
      default: 80,
    },
    /** 右侧预览区域最小宽度 */
    rightMinWidth: {
      type: Number,
      default: 320,
    },
    /** 是否为上下分割 */
    horizontal: {
      type: Boolean,
      default: false,
    },
    /** 拖拽时是否推动其他面板 */
    pushOtherPanes: {
      type: Boolean,
      default: false,
    },
    /** 是否允许双击分割条最大化面板 */
    dblClickSplitter: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['resize', 'resized', 'size-change'],
  setup(props: PltMobileContainerProps, { emit }) {
    const pltMobileContainerRef = ref<HTMLDivElement | null>(null);
    const containerSize = ref(0);
    const isContainerReady = ref(false);
    const splitpanesPanes = ref<PaneData[]>([]);
    let resizeObserver: ResizeObserver | null = null;

    const effectiveOrientation = computed<PltMobileContainerOrientation>(() => {
      return props.orientation || (props.horizontal ? 'column' : 'row');
    });

    const splitpanesHorizontal = computed(() => effectiveOrientation.value === 'column');
    const isDataMode = computed(() => props.data !== undefined);

    const updateContainerSize = () => {
      const element = pltMobileContainerRef.value;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const size = splitpanesHorizontal.value ? rect.height : rect.width;
      containerSize.value = size;
      if (size > 0) {
        isContainerReady.value = true;
      }
    };

    const normalizePercent = (value?: number) => {
      if (!isValidNumber(value)) return undefined;
      return roundNumber(clampPercent(value));
    };

    const sizeToPercent = (size?: PltMobileContainerSize) => {
      const parsedSize = parseSize(size);
      if (!parsedSize) return undefined;

      if (parsedSize.type === 'percent') {
        return normalizePercent(parsedSize.value);
      }

      if (!containerSize.value) return undefined;
      return normalizePercent((parsedSize.value / containerSize.value) * 100);
    };

    const getFlex = (flex?: number) => {
      if (flex === undefined) return 1;
      return isValidNumber(flex) && flex > 0 ? flex : 0;
    };

    const getLegacyPanes = (): ResolvedPaneConfig[] => {
      return [
        {
          key: 'left',
          slot: 'left',
          width: props.leftDefaultWidth,
          minWidth: props.leftMinWidth,
          class: 'plt-mobile-container__pane--left',
          legacySlot: 'left',
        },
        {
          key: 'preview',
          slot: 'preview',
          minWidth: props.rightMinWidth,
          class: 'plt-mobile-container__pane--preview',
          legacySlot: 'preview',
        },
      ];
    };

    const paneConfigs = computed<ResolvedPaneConfig[]>(() => {
      return isDataMode.value ? props.data || [] : getLegacyPanes();
    });

    const resolvedPanes = computed<ResolvedPane[]>(() => {
      const percentConfigs = paneConfigs.value.map((pane, index): PanePercentConfig => {
        const minSize = sizeToPercent(pane.minWidth) || 0;
        const rawMaxSize = sizeToPercent(pane.maxWidth);
        const maxSize = Math.max(minSize, rawMaxSize ?? 100);
        let size = sizeToPercent(pane.width);
        let isAuto = size === undefined;

        if (!isDataMode.value && index === 0 && size === undefined) {
          size = DEFAULT_LEFT_SIZE_PERCENT;
          isAuto = false;
        }

        return {
          size: size === undefined ? undefined : clampPercent(size, minSize, maxSize),
          minSize,
          maxSize,
          flex: getFlex(pane.flex),
          isAuto,
        };
      });
      const sizes = resolvePaneSizes(percentConfigs);

      return paneConfigs.value.map((pane, index) => ({
        key: pane.key ?? index,
        config: pane,
        class: pane.class,
        style: pane.style,
        attrs: pane.attrs,
        size: sizes[index],
        minSize: percentConfigs[index].minSize,
        maxSize: percentConfigs[index].maxSize,
      }));
    });

    const percentToPx = (percent: number) => {
      if (!containerSize.value) return 0;
      return roundNumber((percent / 100) * containerSize.value);
    };

    const getPaneSizeInfos = (panes: PaneData[] = splitpanesPanes.value) => {
      const resolved = resolvedPanes.value;
      const length = Math.max(resolved.length, panes.length);

      return Array.from({ length }, (_, index): PltMobileContainerPaneSizeInfo => {
        const resolvedPane = resolved[index];
        const pane = panes[index];
        const sizePercent = roundNumber(pane?.size ?? resolvedPane?.size ?? 0);
        const minSizePercent = roundNumber(pane?.min ?? resolvedPane?.minSize ?? 0);
        const maxSizePercent = roundNumber(pane?.max ?? resolvedPane?.maxSize ?? 100);

        return {
          index,
          key: resolvedPane?.key,
          sizePercent,
          minSizePercent,
          maxSizePercent,
          sizePx: percentToPx(sizePercent),
          minSizePx: percentToPx(minSizePercent),
          maxSizePx: percentToPx(maxSizePercent),
          config: resolvedPane?.config,
        };
      });
    };

    const paneSizeInfos = computed(() => getPaneSizeInfos());

    const enrichPayload = <T extends { panes: PaneData[] }>(
      payload: T
    ): T & {
      orientation: PltMobileContainerOrientation;
      containerSize: number;
      paneSizes: PltMobileContainerPaneSizeInfo[];
    } => {
      splitpanesPanes.value = payload.panes;

      return {
        ...payload,
        orientation: effectiveOrientation.value,
        containerSize: containerSize.value,
        paneSizes: getPaneSizeInfos(payload.panes),
      };
    };

    const onReady = (payload: SplitpanesReadyPayload) => {
      splitpanesPanes.value = payload.panes;
    };

    const onResize = (payload: SplitpanesResizePayload) => {
      emit('resize', enrichPayload(payload) as PltMobileContainerResizePayload);
    };

    const onResized = (payload: SplitpanesResizedPayload) => {
      const enrichedPayload = enrichPayload(payload) as PltMobileContainerResizedPayload;
      emit('resized', enrichedPayload);
      emit('size-change', enrichedPayload);
    };

    watch(effectiveOrientation, () => {
      nextTick(updateContainerSize);
    });

    onMounted(() => {
      nextTick(updateContainerSize);

      if (typeof ResizeObserver !== 'undefined' && pltMobileContainerRef.value) {
        resizeObserver = new ResizeObserver(updateContainerSize);
        resizeObserver.observe(pltMobileContainerRef.value);
      }

      window.addEventListener('resize', updateContainerSize);
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateContainerSize);
    });

    return {
      pltMobileContainerRef,
      effectiveOrientation,
      splitpanesHorizontal,
      isDataMode,
      isContainerReady,
      resolvedPanes,
      paneSizeInfos,
      onReady,
      onResize,
      onResized,
    };
  },
  render() {
    const renderPaneContent = (pane: ResolvedPane, index: number) => {
      const scope: PltMobileContainerSlotScope = {
        pane: pane.config,
        index,
        size: this.paneSizeInfos[index],
        data: pane.config?.data,
      };

      if (!this.isDataMode) {
        if (pane.config.legacySlot === 'left') {
          return this.$slots.left?.(scope) ?? this.$slots.default?.(scope);
        }
        if (pane.config.legacySlot === 'preview') {
          return this.$slots.preview?.(scope) ?? this.$slots.right?.(scope);
        }
      }

      const paneSlot = pane.config.slot ? this.$slots[pane.config.slot] : undefined;
      return paneSlot?.(scope) ?? this.$slots[`pane-${index}`]?.(scope) ?? this.$slots.default?.(scope);
    };

    const panes = this.resolvedPanes.map((pane, index) => {
      const attrs = pane.attrs || {};
      const { class: attrsClass, style: attrsStyle, ...restAttrs } = attrs;

      return h(
        Pane,
        {
          key: pane.key,
          ...restAttrs,
          class: ['plt-mobile-container__pane', pane.class, attrsClass],
          style: [pane.style, attrsStyle],
          size: pane.size,
          minSize: pane.minSize,
          maxSize: pane.maxSize,
        },
        {
          default: () => renderPaneContent(pane, index),
        }
      );
    });

    return h(
      'div',
      {
        ref: 'pltMobileContainerRef',
        class: 'plt-mobile-container',
      },
      this.isContainerReady
        ? [
            h(
              Splitpanes,
              {
                class: ['plt-mobile-container__splitpanes', this.splitpanesClass],
                style: this.splitpanesStyle,
                horizontal: this.splitpanesHorizontal,
                pushOtherPanes: this.pushOtherPanes,
                maximizePanes: this.dblClickSplitter,
                rtl: this.rtl,
                firstSplitter: this.firstSplitter,
                onReady: this.onReady,
                onResize: this.onResize,
                onResized: this.onResized,
              },
              {
                default: () => panes,
              }
            ),
          ]
        : []
    );
  },
});
