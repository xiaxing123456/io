<template>
  <div class="plt-user-avatar" @click="triggerClick">
    <img
      v-if="avatar"
      class="plt-user-avatar__circle plt-user-avatar__img"
      :src="avatar"
      alt=""
      :style="{ width: `${size}px`, height: `${size}px`, lineHeight: `${size}px` }"
    />
    <div
      v-else
      class="plt-user-avatar__text"
      :style="{
        background: bgColor || '#006EFF',
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
      }"
    >
      {{ getAvatarText }}
    </div>
    <span v-show="showName" class="plt-user-avatar__username">
      {{ username }}
    </span>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

type PltUserProps = import('../../types/plt-user-avatar/plt-user-avatar').PltUserProps;

defineOptions({
  name: 'PltUserAvatar',
});
const props = withDefaults(
  defineProps<PltUserProps>(),
  {
    avatar: '',
    size: 26,
    bgColor: 'linear-gradient(#4c99ff, #006eff)',
    username: '',
    showName: false,
  }
);
const emits = defineEmits(['click']);
const getAvatarText = computed(() => {
  return props.username ? props.username.slice(-1) : '';
});

const triggerClick = () => {
  emits('click');
};
</script>

<style lang="scss" scoped>
.plt-user-avatar {
  &__circle {
    text-align: center;
    border-radius: 100%;
  }
  &__img {
    vertical-align: middle;
  }
  &__text {
    display: inline-block;
    color: #ffffff;
    background: linear-gradient(#4c99ff, #006eff);
  }
  &__username {
    padding-left: 6px;
  }
}
</style>
