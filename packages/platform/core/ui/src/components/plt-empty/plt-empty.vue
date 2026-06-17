<template>
  <div class="plt-empty">
    <div class="plt-empty__image">
      <slot name="image">
        <div :style="imageStyle">
          <img :src="image" />
        </div>
      </slot>
    </div>
    <div class="plt-empty__description">
      <slot name="description">
        <p>{{ description }}</p>
      </slot>
    </div>
    <div class="plt-empty__bottom">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { PltEmptyProps } from '../../types/plt-empty/plt-empty';

defineOptions({
  name: 'PltEmpty',
});

const props = withDefaults(defineProps<PltEmptyProps>(), {
  image: '',
  width: '',
  height: '',
  description: '暂无数据',
});

const imageWidth = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px`;
  return props.width;
});

const imageHeight = computed(() => {
  if (typeof props.height === 'number') return `${props.height}px`;
  return props.height;
});

const imageStyle = computed(() => {
  const params = {} as Record<string, string>;
  if (imageHeight.value) params.height = imageHeight.value;
  if (imageWidth.value) params.width = imageWidth.value;
  return params;
});
</script>

<style lang="scss" scoped>
.plt-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
}

.plt-empty .plt-empty__image img {
  user-select: none;
  width: 100%;
  height: 100%;
  vertical-align: top;
  object-fit: contain;
}

.plt-empty .plt-empty__description {
  margin-top: var(--plt-basic-padding-common);
  font-size: var(--plt-basic-font-size-common);
  box-sizing: border-box;
}

.plt-empty .plt-empty__bottom {
  margin-top: var(--plt-basic-padding-xl);
}

.plt-empty .plt-empty__bottom .el-button + .el-button {
  margin-left: var(--plt-basic-padding-xxl);
}
</style>
