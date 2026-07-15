<template>
  <div class="app-main">
    <plt-mobile-container :data="layoutMainList" orientation="row">
      <template #nav>
        <app-nav></app-nav>
      </template>
      <template #main>
        <app-header></app-header>
        <div class="app-body">
          <router-view v-slot="{ Component, route }">
            <keep-alive>
              <component :is="Component" :key="route.fullPath"></component>
            </keep-alive>
          </router-view>
        </div>
      </template>
    </plt-mobile-container>
  </div>
</template>
<script lang="ts" setup>
import AppHeader from '@admin-web/views/layout/components/app-header/app-header.vue';
import AppNav from '@admin-web/views/layout/components/app-nav/app-nav.vue';

import { ref } from 'vue';

/** 主页面布局 */
const layoutMainList = ref([
  { key: 'nav', slot: 'nav', width: 260, minWidth: 80, maxWidth: 400 },
  { key: 'main', slot: 'main' },
]);
</script>

<style lang="scss" scoped>
.app-main {
  height: 100%;
  width: 100%;
  overflow: hidden;
  .app-body {
    width: 100%;
    height: calc(100% - 50px);
    padding: 20px;
  }
}
</style>
