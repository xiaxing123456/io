<template>
  <aside class="app-nav">
    <div class="company-logo">
      <img />
    </div>
    <div class="company-name">
      <span>AgentiCenter PCM</span>
    </div>
    <div class="nav-box">
      <app-menu
        v-if="currentMenuList.length"
        :menu-data="currentMenuList"
        :menu-props="menuOptionsProps"
        :menu-default-active="menuDefaultActive"
      ></app-menu>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import AppMenu from '@admin-vue/views/layout/sidebar/menu/menu.vue';

import { nav } from '@admin-vue/views/layout/nav/nav';
defineOptions({
  name: 'AppNav',
});

const { currentMenuList, menuOptionsProps, menuDefaultActive } = nav();
</script>
<style lang="scss" scoped>
.app-nav {
  height: 100%;
  background-color: var(--plt-menu-background-color);
  &-box {
    height: 100%;
    overflow: auto;
  }
}
</style>
