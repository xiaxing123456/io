/** Loading 覆盖目标：可以传 DOM，也可以传 CSS 选择器。 */
export type LoadingTarget = string | HTMLElement;

/**
 * Loading 父元素。
 *
 * 当前实现会在 parent 上写入临时属性，用于标记 loading 状态和还原 z-index。
 */
export interface LoadingParentElement extends HTMLElement {
    /** 创建 loading 时写入，关闭后置空；用于兼容旧实现中的内部标记。 */
    vLoadingAddClassList?: (() => void) | null;
}

/** Loading service 入参。 */
export interface LoadingOptions {
    /** Loading 覆盖目标；不传时默认使用 document.body。 */
    target?: LoadingTarget;
    /** 是否全屏；只有最终 target 是 document.body 时才按全屏处理。 */
    fullscreen?: boolean;
    /** 是否按 body 模式处理；body 模式下 parent 使用 document.body。 */
    body?: boolean;
    /** 是否锁定滚动；需要 .plt-loading-parent--hidden 样式配合。 */
    lock?: boolean;
    /** 追加到 parent 上的自定义 class。 */
    customClass?: string;
}

/** service 内部使用的完整配置。 */
export interface NormalizedLoadingOptions extends Omit<LoadingOptions, 'target'> {
    /** 已解析完成的目标 DOM。 */
    target: HTMLElement;
    /** 实际追加 class、记录计数和还原 z-index 的元素。 */
    parent: LoadingParentElement;
    /** 是否按 body 模式处理。 */
    body: boolean;
    /** 是否全屏 loading。 */
    fullscreen: boolean;
}

/** Loading 实例，外部只需要通过 close 关闭。 */
export interface LoadingInstance {
    /** 当前实例管理的父元素。 */
    readonly parent: LoadingParentElement;
    /** 当前实例是否是全屏 loading。 */
    readonly fullscreen: boolean;
    /** 关闭当前 loading，并在计数归零时清理 class 和 z-index。 */
    close: () => void;
}

/** 全局状态：用于控制全屏 loading 单例。 */
export interface LoadingGlobalState {
    fullscreenLoading?: LoadingInstance | null;
}

/** 每个 parent 对应的内部状态。 */
export interface LoadingParentState {
    /** 当前 parent 上还未关闭的 loading 数量。 */
    loadingNumber: number;
    /** 创建第一个 loading 前的行内 z-index。 */
    oldZIndex: string;
    /** 当前 parent 上由 loading 追加过的自定义 class。 */
    customClassList: Set<string>;
}
