<template>
  <vxe-modal ref="pltDialogRef" class="plt-dialog" v-bind="modalAttrs">
    <template v-for="slotName in passthroughSlotNames" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
    <template #title="slotProps">
      <slot v-if="$slots.title" name="title" v-bind="slotProps"></slot>
      <plt-tooltip v-else :content="props.title">
        <span>{{ props.title }}</span>
      </plt-tooltip>
    </template>
    <template #footer="slotProps">
      <slot v-if="$slots.footer" name="footer" v-bind="slotProps"></slot>
    </template>
  </vxe-modal>
</template>
<script lang="ts" setup>
import type { PltDialogEmits, PltDialogProps } from '../../types/plt-dialog/plt-dialog';

import { computed, useSlots } from 'vue';
import { pltDialog } from './plt-dialog';

defineOptions({
  name: 'PltDIalog',
});

const props = withDefaults(defineProps<PltDialogProps>(), {
  showZoom: true,
  resize: true,
  showMinimize: false,
  escClosable: true,
  minWidth: 320,
  minHeight: 480,
  width: '40%',
  height: '70%',
  mask: false,
  maskClosable: false,
  className: '',
});
const emits = defineEmits<PltDialogEmits>();
const slots = useSlots();

const dialogInnerSlotNames = ['title', 'footer'];
const passthroughSlotNames = computed(() =>
  Object.keys(slots).filter(slotName => !dialogInnerSlotNames.includes(slotName))
);

const { pltDialogRef, modalAttrs } = pltDialog(props, emits);
</script>

<style lang="scss" scoped>
@use './plt-dialog.scss';
</style>
