import type {
  PaneData,
  SplitpanesResizePayload,
  SplitpanesResizedPayload,
} from 'splitpanes';

export type PltMobileContainerOrientation = 'row' | 'column';
export type PltMobileContainerSize = number | string;

export interface PltMobileContainerPaneConfig {
  /** 面板唯一标识 */
  key?: string | number;
  /** 面板对应插槽名 */
  slot?: string;
  /** 主轴默认尺寸，row 模式为宽度，column 模式为高度 */
  width?: PltMobileContainerSize;
  /** 主轴最小尺寸，row 模式为宽度，column 模式为高度 */
  minWidth?: PltMobileContainerSize;
  /** 主轴最大尺寸，row 模式为宽度，column 模式为高度 */
  maxWidth?: PltMobileContainerSize;
  /** 剩余空间分配权重，优先级低于 width */
  flex?: number;
  /** 面板自定义类名 */
  class?: unknown;
  /** 面板自定义样式 */
  style?: unknown;
  /** 透传到 Pane 的属性 */
  attrs?: Record<string, unknown>;
  /** 用户自定义数据 */
  data?: unknown;
}

export interface PltMobileContainerPaneSizeInfo {
  /** 面板索引 */
  index: number;
  /** 面板唯一标识 */
  key?: string | number;
  /** 当前尺寸百分比 */
  sizePercent: number;
  /** 最小尺寸百分比 */
  minSizePercent: number;
  /** 最大尺寸百分比 */
  maxSizePercent: number;
  /** 当前尺寸像素值 */
  sizePx: number;
  /** 最小尺寸像素值 */
  minSizePx: number;
  /** 最大尺寸像素值 */
  maxSizePx: number;
  /** 原始面板配置 */
  config?: PltMobileContainerPaneConfig;
}

export interface PltMobileContainerPayloadExtra {
  /** 当前布局方向 */
  orientation: PltMobileContainerOrientation;
  /** 当前布局方向上的容器尺寸 */
  containerSize: number;
  /** 每个面板的尺寸信息 */
  paneSizes: PltMobileContainerPaneSizeInfo[];
}

export interface PltMobileContainerProps {
  /** 面板配置数据 */
  data?: PltMobileContainerPaneConfig[];
  /** 布局方向 */
  orientation?: PltMobileContainerOrientation;
  /** splitpanes 自定义类名 */
  splitpanesClass?: unknown;
  /** splitpanes 自定义样式 */
  splitpanesStyle?: unknown;
  /** 是否 RTL */
  rtl: boolean;
  /** 是否展示首个分割条 */
  firstSplitter: boolean;
  /** 左侧默认宽度 */
  leftDefaultWidth: number;
  /** 左侧最小宽度 */
  leftMinWidth: number;
  /** 右侧预览区域最小宽度 */
  rightMinWidth: number;
  /** 是否为上下分割 */
  horizontal: boolean;
  /** 拖拽时是否推动其他面板 */
  pushOtherPanes: boolean;
  /** 是否允许双击分割条最大化面板 */
  dblClickSplitter: boolean;
}

export interface PltMobileContainerSlotScope {
  /** 当前面板配置 */
  pane?: PltMobileContainerPaneConfig;
  /** 当前面板索引 */
  index: number;
  /** 当前面板尺寸信息 */
  size: PltMobileContainerPaneSizeInfo;
  /** 当前面板自定义数据 */
  data?: unknown;
}

export type PltMobileContainerSplitpanesPaneData = PaneData;
export type PltMobileContainerResizePayload = SplitpanesResizePayload &
  PltMobileContainerPayloadExtra;
export type PltMobileContainerResizedPayload = SplitpanesResizedPayload &
  PltMobileContainerPayloadExtra;
