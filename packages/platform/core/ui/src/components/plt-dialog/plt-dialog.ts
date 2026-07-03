import type { VxeModalPropTypes } from 'vxe-pc-ui';
import type {
  BeforeHideHandler,
  PltDialogEmits,
  PltDialogProps,
} from '../../types/plt-dialog/plt-dialog';

import { computed, ref, useAttrs } from 'vue';
import { useDragConstrain } from './composables/use-drag-constrain';

export const pltDialog = (props: PltDialogProps, emits: PltDialogEmits) => {
  const attrs = useAttrs();
  const { handleMove } = useDragConstrain(props);

  const pltDialogRef = ref(null);
  const beforeHideFn = ref<BeforeHideHandler>();

  const handleClose = (close = true) => {
    if (!close) return;
    emits('update:modelValue', false);
    beforeHideFn.value = () => true;
  };

  /** 弹窗隐藏前置方法 */
  const beforeHideMethod = () => {
    window?.getSelection()?.empty();
    if (props.beforeHideMethod && props.modelValue) {
      props.beforeHideMethod(handleClose);
      return new Error('stop close');
    }
    return undefined;
  };

  const showModal = () => {
    // 禁用浏览器默认选中文本
    window?.getSelection()?.empty();

    beforeHideFn.value = beforeHideMethod;
    emits('show');
  };

  const handleUpdateModelValue = (value: VxeModalPropTypes.ModelValue) => {
    if (typeof value !== 'boolean') return;
    emits('update:modelValue', value);
  };

  const modalAttrs = computed(() => ({
    ...attrs,
    ...props,
    beforeHideMethod,
    onShow: showModal,
    onMove: handleMove,
    'onUpdate:modelValue': handleUpdateModelValue,
  }));

  return {
    pltDialogRef,
    modalAttrs,
  };
};
