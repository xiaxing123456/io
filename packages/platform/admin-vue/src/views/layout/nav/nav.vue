<template>
  <aside class="app-nav">
    <div class="company-logo">
      <img />
    </div>
    <div class="company-name">
      <span>AgentiCenter PCM</span>
      {{ currentMenuList.length }}
    </div>
    <div class="nav-box">
      <app-menu
        v-if="currentMenuList.length"
        :menu-data="currentMenuList"
        :menu-props="menuOptionsProps"
        :menu-default-active="menuDefaultActive"
      ></app-menu>
    </div>
    <div class="nav-foot" @click="initMenuData({ isChangeNavigation: true })">
      {{ menuModelTitle }}
    </div>
  </aside>
</template>

<script lang="ts" setup>
import AppMenu from '@admin-vue/views/layout/sidebar/menu/menu.vue';

import { nav } from '@admin-vue/views/layout/nav/nav';
defineOptions({
  name: 'AppNav',
});

const { menuModelTitle, currentMenuList, menuOptionsProps, menuDefaultActive, initMenuData } =
  nav();
</script>
<style lang="scss" scoped>
.app-nav {
  height: 100%;
  background-color: var(--plt-menu-background-color);
  display: flex;
  flex-direction: column;
  .nav-box {
    flex: 1;
    overflow: auto;
  }
  .nav-foot {
    padding: var(--plt-basic-padding-common);
    cursor: pointer;
  }
}
</style>
