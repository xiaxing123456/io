import '../plt-loading.scss';
import { addClass, removeClass } from './common';
import {
  defaultZIndex,
  loadingHiddenClass,
  loadingNumberAttribute,
  loadingRelativeClass,
  loadingWrapClass,
  oldZIndexAttribute,
} from './constants';
import type {
  LoadingGlobalState,
  LoadingInstance,
  LoadingOptions,
  LoadingParentElement,
  LoadingParentState,
  LoadingTarget,
  NormalizedLoadingOptions,
} from './plt-loading.types';

const globalState: LoadingGlobalState = {
  fullscreenLoading: null,
};

const parentStateMap = new WeakMap<LoadingParentElement, LoadingParentState>();

let loadingZIndex = 1000;

/**
 * 获取下一个 loading 层级。
 *
 * 当前在组件内部维护层级；后续如果要接入平台弹层体系，只需要替换这个函数内部实现。
 */
const getNextLoadingZIndex = () => {
  loadingZIndex += 1;

  return loadingZIndex;
};

/**
 * 获取 class 列表。
 *
 * customClass 允许传多个 class，因此需要按空格拆分后逐个记录，便于关闭时清理。
 */
const getClassList = (className?: string) => {
  return (className || '').split(' ').filter(item => !!item.trim());
};

/** 解析 loading 目标元素；选择器未命中时回退到 document.body。 */
const resolveTarget = (target?: LoadingTarget): HTMLElement => {
  if (typeof target === 'string') {
    const matchedElement = document.querySelector(target);

    return matchedElement instanceof HTMLElement ? matchedElement : document.body;
  }

  return target || document.body;
};

/**
 * 规范化配置。
 *
 * 这里统一完成 target 解析、body 判断、fullscreen 修正和 parent 计算。
 */
const normalizeOptions = (options: LoadingOptions = {}): NormalizedLoadingOptions => {
  const target = resolveTarget(options.target);
  const isBodyTarget = target === document.body;
  const body = isBodyTarget || !!options.body;
  const fullscreen = isBodyTarget ? options.fullscreen !== false : false;
  const parent = (body ? document.body : target) as LoadingParentElement;

  return {
    ...options,
    target,
    body,
    fullscreen,
    parent,
  };
};

/** 获取 parent 状态；首次打开 loading 时初始化。 */
const getParentState = (parent: LoadingParentElement) => {
  const cachedState = parentStateMap.get(parent);

  if (cachedState) {
    return cachedState;
  }

  const state: LoadingParentState = {
    loadingNumber: 0,
    oldZIndex: parent.style.zIndex,
    customClassList: new Set<string>(),
  };

  parentStateMap.set(parent, state);

  return state;
};

/** 保存旧 z-index，并设置当前 loading 需要的 z-index。 */
const saveAndApplyZIndex = (parent: LoadingParentElement, fullscreen: boolean) => {
  const parentZIndex = window.getComputedStyle(parent).getPropertyValue('z-index');

  parent.setAttribute(oldZIndexAttribute, parent.style.zIndex);

  if (fullscreen) {
    parent.style.zIndex = getNextLoadingZIndex().toString();
    return;
  }

  if (parentZIndex === 'auto') {
    parent.style.zIndex = defaultZIndex;
  }
};

/** 还原创建 loading 前的 z-index。 */
const restoreZIndex = (parent: LoadingParentElement, state: LoadingParentState) => {
  parent.style.zIndex = state.oldZIndex;
  parent.removeAttribute(oldZIndexAttribute);
};

/** 添加 loading 展示所需 class。 */
const addLoadingClasses = (options: NormalizedLoadingOptions, state: LoadingParentState) => {
  const { parent, customClass, fullscreen, lock } = options;

  addClass(parent, loadingRelativeClass);
  addClass(parent, loadingWrapClass);

  getClassList(customClass).forEach(className => {
    state.customClassList.add(className);
    addClass(parent, className);
  });

  if (fullscreen && lock) {
    addClass(parent, loadingHiddenClass);
  }
};

/** 移除 loading 相关 class。 */
const removeLoadingClasses = (parent: LoadingParentElement, state: LoadingParentState) => {
  removeClass(parent, loadingRelativeClass);
  removeClass(parent, loadingWrapClass);
  removeClass(parent, loadingHiddenClass);

  state.customClassList.forEach(className => {
    removeClass(parent, className);
  });
};

/**
 * 打开 parent 上的 loading。
 *
 * 第一个 loading 打开时才保存 z-index；后续同 parent loading 只增加计数。
 */
const openParentLoading = (options: NormalizedLoadingOptions) => {
  const { parent, fullscreen } = options;
  const state = getParentState(parent);

  if (state.loadingNumber === 0) {
    saveAndApplyZIndex(parent, fullscreen);
  }

  state.loadingNumber += 1;
  parent.setAttribute(loadingNumberAttribute, state.loadingNumber.toString());
  parent.vLoadingAddClassList = () => addLoadingClasses(options, state);

  addLoadingClasses(options, state);
};

/**
 * 关闭 parent 上的一次 loading。
 *
 * 计数归零时才清理 class 和还原 z-index，避免多个请求共用同一区域时提前关闭遮罩。
 */
const closeParentLoading = (parent: LoadingParentElement) => {
  const state = parentStateMap.get(parent);

  if (!state) {
    return;
  }

  state.loadingNumber = Math.max(state.loadingNumber - 1, 0);

  if (state.loadingNumber > 0) {
    parent.setAttribute(loadingNumberAttribute, state.loadingNumber.toString());
    return;
  }

  removeLoadingClasses(parent, state);
  restoreZIndex(parent, state);
  parent.removeAttribute(loadingNumberAttribute);
  parent.vLoadingAddClassList = null;
  parentStateMap.delete(parent);
};

/** 创建 loading 实例，并提供幂等 close。 */
const createLoadingInstance = (options: NormalizedLoadingOptions): LoadingInstance => {
  const { parent, fullscreen } = options;
  let closed = false;

  const instance: LoadingInstance = {
    parent,
    fullscreen,
    close: () => {
      if (closed) {
        return;
      }

      closed = true;

      if (fullscreen && globalState.fullscreenLoading === instance) {
        globalState.fullscreenLoading = null;
      }

      closeParentLoading(parent);
    },
  };

  return instance;
};

/**
 * 创建 loading。
 *
 * 主流程：规范化配置 -> 处理全屏单例 -> 添加 class 和计数 -> 返回可关闭实例。
 */
export const loading = (options: LoadingOptions = {}): LoadingInstance => {
  const normalizedOptions = normalizeOptions(options);
  const { fullscreen } = normalizedOptions;

  if (fullscreen && globalState.fullscreenLoading) {
    globalState.fullscreenLoading.close();
  }

  openParentLoading(normalizedOptions);

  const instance = createLoadingInstance(normalizedOptions);

  if (fullscreen) {
    globalState.fullscreenLoading = instance;
  }

  return instance;
};

export default loading;
