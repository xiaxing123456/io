<template>
  <main class="plt-container main-page">
    <plt-mobile-container :data="layoutMainList" orientation="row">
      <template #nav>
        <div class="main-nav">
          <div class="company-logo">
            <img />
          </div>
          <div class="company-name">
            <span>AgentiCenter PCM</span>
          </div>
          <app-nav></app-nav>
        </div>
      </template>
      <template #main>
        <div class="main-top">
          <app-header></app-header>
        </div>
        <div class="main-container">222</div>
      </template>
    </plt-mobile-container>
  </main>
</template>

<script lang="ts" setup>
import AppHeader from '@admin-vue/views/layout/header/header.vue';
import AppNav from '@admin-vue/views/layout/nav/nav.vue';

import { main } from '@admin-vue/views/layout/main/main';

const { layoutMainList } = main();
</script>

<style lang="scss" scoped>
.main-page {
  .main-nav {
    height: 100%;
    background-color: var(--plt-menu-background-color);
  }
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
