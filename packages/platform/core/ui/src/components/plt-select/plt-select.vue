<template>
  <el-select class="plt-select" v-bind="getAttrs">
    <template v-for="name in forwardSlotNames" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
    <template #empty>
      <slot name="empty">
        <div>
          <plt-empty
            v-if="!props.loading"
            image-height="48px"
            image-width="62px"
            :image="emptyImg"
          />
        </div>
      </slot>
    </template>
  </el-select>
</template>
<script lang="ts" setup>
import type { PltSelectEmits, PltSelectProps } from '../../types';

import { computed, h, onUnmounted, ref, useAttrs, useSlots } from 'vue';
import { isUndefined } from 'xe-utils';
import { PltEmpty, PltIcon } from '..';
import emptyImg from '../../assets/images/empty/search-empty.webp';

defineOptions({
  name: 'PltSelect',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<PltSelectProps>(), {
  clearable: true,
  placeholder: '',
  popperClass: '',
  optionLineType: 'break',
  remote: false,
  loading: false,
  isChangeKeepFocus: false,
});

const emits = defineEmits<PltSelectEmits>();
const attrs = useAttrs();
const slots = useSlots();
const forwardSlotNames = computed(() => {
  return Object.keys(slots).filter(name => name !== 'empty');
});

const pltSelect = ref();

const onMousedown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const selectElement = pltSelect.value?.$el;

  const poppers = document.querySelectorAll('.el-select__popper');

  const currentPopper = Array.from(poppers).find(
    popper => popper instanceof HTMLElement && popper.getAttribute('aria-hidden') === 'false'
  );

  if (
    selectElement &&
    !selectElement.contains(target) &&
    (!currentPopper || !currentPopper.contains(target))
  ) {
    pltSelect.value?.blur();
  }
};

const onVisibleChange = (visible: boolean) => {
  emits('visibleChange', visible);

  if (visible) {
    document.addEventListener('mousedown', onMousedown);
  } else {
    document.removeEventListener('mousedown', onMousedown);
  }
};

onUnmounted(() => {
  document.removeEventListener('mousedown', onMousedown);
});

const onChange = (val: string) => {
  if ((isUndefined(attrs.multiple) || attrs.multiple === false) && !props.isChangeKeepFocus) {
    pltSelect.value?.blur();
  }

  emits('change', val);
};

const getClearIconSlot = () => {
  if (slots.clearIcon) {
    return slots.clearIcon();
  }

  return h(PltIcon, {
    icon: 'icon-plt-close_fill',
    size: 14,
  });
};

const getAttrs = computed(() => ({
  filterable: true,
  reserveKeyword: false,
  ...attrs,
  ...props,
  onVisibleChange,
  onChange,
  clearIcon: getClearIconSlot,
}));
</script>

<style lang="scss" scoped>
/* todo ui要求不能一开始就出现暂无数据再有loading，故与loading动画效果时间保持一致 */
.plt-select__empty {
  height: 126px;

  .plt-empty {
    opacity: 0; /* 初始状态为隐藏 */
    animation: show 0.25s ease-in-out 0.25s forwards; /* 使用动画效果延迟显示，总时长为 0.3s，延迟 0.3s */
  }
}
</style>
