<template>
  <aside class="nav">
    <div class="nav-box">
      <app-menu ref="menuRef" @add-loading="addLoading" />
    </div>
  </aside>
</template>

<script lang="ts">
import AppMenu from '@admin-vue/views/layout/sidebar/menu/menu.vue';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'AppNav',
  components: { AppMenu },
  props: {
    menuData: {
      type: Object as PropType<AnyObj>,
      default: () => ({}),
    },
  },
  emits: ['add-loading'],
  setup(props, { emit }) {
    /** 将父组件添加loading的回调传递给子组件 */
    const addLoading = () => {
      emit('add-loading');
    };
    const menuRef = ref();
    const expandAll = (searchValue: string) => {
      menuRef.value.expandAll(searchValue);
    };
    return { addLoading, menuRef, expandAll };
  },
});
</script>
<style lang="scss" scoped>
.nav {
  flex: 1;
  position: relative;
  width: 100%;
  padding-right: 2px;
  box-sizing: border-box;
  // @include backgroundColor();
  overflow: auto;
  &-box {
    height: 100%;
    overflow: auto;
    // margin-right: 1px;
  }
}
</style>
