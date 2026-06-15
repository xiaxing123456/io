<template>
  <main class="plt-container main-container">
    <div class="main-container_left">
      <div class="company-logo">
        <img />
      </div>
      <div class="company-name">
        <span>AgentiCenter PCM</span>
      </div>
      <app-nav></app-nav>
    </div>
    <div class="main-container_right"></div>
  </main>
</template>

<script lang="ts" setup>
import AppNav from '@admin-vue/views/layout/nav/nav.vue';
</script>

<style lang="scss" scoped>
.main-container {
  &_left {
  }
  &_right {
  }
}
</style>
