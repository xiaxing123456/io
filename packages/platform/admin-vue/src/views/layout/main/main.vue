<template>
  <main class="plt-container main-container">
    <plt-mobile-container :data="layoutMainList" orientation="row">
      <template #nav>
        <div class="company-logo">
          <img />
        </div>
        <div class="company-name">
          <span>AgentiCenter PCM</span>
        </div>
        <app-nav></app-nav>
      </template>
      <template #main>配置区</template>
    </plt-mobile-container>
  </main>
</template>

<script lang="ts" setup>
import { main } from '@admin-vue/views/layout/main/main';
import AppNav from '@admin-vue/views/layout/nav/nav.vue';

const { layoutMainList } = main();
</script>

<style lang="scss" scoped>
.main-container {
  &_left {
  }
  &_right {
  }
}
</style>
