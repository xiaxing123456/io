<template>
  <main class="plt-container main-page">
    <plt-mobile-container :data="layoutMainList" orientation="row">
      <template #nav>
        <app-nav></app-nav>
      </template>
      <template #main>
        <div class="main-top">
          <app-header></app-header>
          <app-tabs-bar></app-tabs-bar>
        </div>
        <div class="main-container">222</div>
      </template>
    </plt-mobile-container>
  </main>
</template>

<script lang="ts" setup>
import AppHeader from '@admin-vue/views/layout/header/header.vue';
import AppNav from '@admin-vue/views/layout/nav/nav.vue';
import AppTabsBar from '@admin-vue/views/layout/tabs-bar/tabs-bar.vue';

import { main } from '@admin-vue/views/layout/main/main';

const { layoutMainList } = main();
</script>

<style lang="scss" scoped>
.main-page {
  .main-top {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    background: var(--plt-basic-bg-color);
  }
  .main-container {
  }
}
</style>
