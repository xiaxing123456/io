import { PltDialogProps, UseDragConstrainReturn } from '../../../../types/plt-dialog/plt-dialog';

export const useDragConstrain = (props: PltDialogProps): UseDragConstrainReturn => {
  /** 获取约束容器元素 */
  const getContainerElement = (): HTMLElement | null => {
    if (!props.dragContainSelector) {
      return null;
    }

    if (typeof props.dragContainSelector === 'string') {
      return document.querySelector(props.dragContainSelector);
    }

    return props.dragContainSelector.value;
  };

  /**
   * 计算约束后的位置坐标
   *
   * @param containerRect - 容器的 DOMRect
   * @param modalRect - 弹窗的 DOMRect
   * @returns 约束后的坐标及是否需要更新
   */
  const constrainPosition = (
    containerRect: DOMRect,
    modalRect: DOMRect
  ): { left: number; top: number; needsUpdate: boolean } => {
    const { left: minLeft, top: minTop, right, bottom } = containerRect;
    const { left: currentLeft, top: currentTop, width, height } = modalRect;

    // 将坐标限制在容器的 [min, max] 范围内
    const left = Math.min(Math.max(currentLeft, minLeft), right - width);
    const top = Math.min(Math.max(currentTop, minTop), bottom - height);
    // 坐标发生变化时才需要更新弹窗位置
    const needsUpdate = left !== currentLeft || top !== currentTop;

    return { left, top, needsUpdate };
  };

  /**
   * 弹窗移动事件处理
   *
   * @description 在弹窗拖拽移动时调用，自动将弹窗位置约束在容器边界内。
   * 若未配置 `dragContainSelector` 或容器元素不存在，则不做任何处理。
   *
   * @param params - vxe-modal 的移动事件参数
   */
  const handleMove: UseDragConstrainReturn['handleMove'] = params => {
    const containerEl = getContainerElement();
    const modalEl = params.$modal?.getBox?.();

    if (!containerEl || !modalEl) {
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const modalRect = modalEl.getBoundingClientRect();
    const { left, top, needsUpdate } = constrainPosition(containerRect, modalRect);

    if (needsUpdate) {
      params.$modal?.setPosition?.(top, left);
    }
  };

  return { handleMove };
};
