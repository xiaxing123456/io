<template>
  <el-tooltip ref="tooltipEl" class="plt-tooltip__content" v-bind="getAttrs">
    <template v-for="name in slotNames" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </el-tooltip>
</template>

<script lang="ts" setup>
import type { PltTooltipProps } from '../../types/plt-tooltip/plt-tooltip';

import { computed, onMounted, onUnmounted, ref, useAttrs, useSlots } from 'vue';
import { getElContentWidth } from '../../utils/style';
import { useTextWidth } from '../plt-menu/src/composables/use-text-width';

defineOptions({
  name: 'PltTooltip',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<PltTooltipProps>(), {
  disabled: false,
  alwaysShow: false,
  multiLine: false,
  isControlShowTooltip: false,
});

const attrs = useAttrs();
const slots = useSlots();
const tooltipEl = ref<any>();
const showTooltip = ref(true);
const slotNames = computed(() => Object.keys(slots));

const FIXED_POPPER_CLASS = 'plt-tooltip-popper';

let triggerEl: HTMLElement | undefined;

const getTriggerEl = () => {
  const triggerRef = tooltipEl.value?.popper?.triggerRef;

  if (triggerRef instanceof HTMLElement) {
    return triggerRef;
  }

  if (triggerRef?.value instanceof HTMLElement) {
    return triggerRef.value;
  }

  return tooltipEl.value?.$el?.parentElement as HTMLElement | undefined;
};

const outsideRangeWidth = (targetElement: HTMLElement) => {
  if (props.multiLine) {
    // 多行文本超出隐藏判断
    return (
      Math.floor((targetElement?.children[0] as HTMLElement)?.offsetHeight || 0) >
      Math.floor(targetElement.offsetHeight)
    );
  }

  const { calculateTextWidth } = useTextWidth(targetElement);
  return calculateTextWidth(attrs.content as string) > getElContentWidth(targetElement);
};

const handleShowTooltip = () => {
  if (!triggerEl) return;

  showTooltip.value = !outsideRangeWidth(triggerEl);
};

const handleElEvent = () => {
  triggerEl = getTriggerEl();
  if (!triggerEl) return;

  triggerEl.removeEventListener('mouseenter', handleShowTooltip);
  triggerEl.addEventListener('mouseenter', handleShowTooltip);
};

const getAttrs = computed(() => {
  const userPopperClass = (attrs.popperClass as string) || '';

  return {
    effect: 'light',
    placement: 'top-start',
    enterable: false,
    ...attrs,
    isControlShowTooltip: props.isControlShowTooltip,
    popperClass: userPopperClass
      ? `${FIXED_POPPER_CLASS} ${userPopperClass}`
      : FIXED_POPPER_CLASS,
    disabled: props.disabled || (showTooltip.value && !props.isControlShowTooltip),
  };
});

onMounted(() => {
  showTooltip.value = false;
  if (!props.alwaysShow && !props.isControlShowTooltip) {
    handleElEvent();
  }
});

onUnmounted(() => {
  triggerEl?.removeEventListener('mouseenter', handleShowTooltip);
});
</script>

<style src="./plt-tooltip.css"></style>
