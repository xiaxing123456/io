<template>
  <div class="plt-container">
    <plt-mobile-container :data="layoutMainList" orientation="row">
      <template #nav>
        <app-nav></app-nav>
      </template>
      <template #main></template>
    </plt-mobile-container>
  </div>
</template>
<script lang="ts" setup>
import AppNav from '@admin-web/views/layout/components/app-nav/app-nav.vue';
import { ref } from 'vue';

/** 主页面布局 */
const layoutMainList = ref([
  { key: 'nav', slot: 'nav', width: 260, minWidth: 80, maxWidth: 400 },
  { key: 'main', slot: 'main' },
]);
</script>

<style lang="scss" scoped></style>
