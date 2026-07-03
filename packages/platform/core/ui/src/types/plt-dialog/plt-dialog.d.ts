export interface PltDialogProps {
  /** 是否显示  默认false */
  modelValue: boolean;
  /** 弹窗标题 */
  title: string;
  /** 是否显示最大化与最小化按钮 默认true */
  showZoom?: boolean;
  /** 是否允许窗口边缘拖动调整窗口大小 默认true */
  resize?: boolean;
  /** 是否显示最小化按钮 默认false */
  showMinimize?: boolean;
  /** 是否允许按 Esc 键关闭窗口 默认true */
  escClosable?: boolean;
  /** 弹窗最小宽度 默认320 */
  minWidth?: number;
  /** 弹窗最小高度 默认480 */
  minHeight?: number;
  /** 弹窗默认宽度 默认40% */
  width?: number | string;
  /** 弹窗默认高度 默认70% */
  height?: number | string;
  /** 是否显示遮罩层 默认false */
  mask?: boolean;
  /** 是否允许点击遮罩层关闭窗口 默认false */
  maskClosable?: boolean;
  /** 自定义类名 默认'' */
  className?: string;
  /** 容器选择器，支持 CSS 选择器字符串或 Ref<HTMLElement | null> */
  dragContainSelector?: string | Ref<HTMLElement | null>;

  /** 弹窗隐藏前置方法  */
  beforeHideMethod?: BeforeHideMethod;
}

export interface PltDialogEmits {
  /** 弹窗显示事件 */
  (e: 'show'): void;
  /** 弹窗显隐变量改变事件 */
  (e: 'update:modelValue', state: boolean): void;
}

export type DialogCloseHandler = (close?: boolean) => void;

export type BeforeHideMethod = (next: DialogCloseHandler) => void;

export type BeforeHideResult = Error | boolean | undefined;
export type BeforeHideHandler = () => BeforeHideResult | Promise<BeforeHideResult>;

/** useDragConstrain Hook 返回类型 */
export interface UseDragConstrainReturn {
  /** 弹窗移动事件处理，绑定到 vxe-modal 的 onMove */
  handleMove: (params: VxeModalDefines.MoveEventParams) => void;
}
