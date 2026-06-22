<template>
  <div class="tabs-bar-container tabs-bar">
    <div class="tabs-bar-box">
      <div class="tabs-bar-list">
        <div
          v-for="(item, index) in barsList"
          :key="index"
          class="tabs-bar-item"
          :class="{ 'tabs-bar-item-active': item.fullPath === activeTabFullPath }"
        >
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { tabsBar } from '@admin-vue/views/layout/tabs-bar/tabs-bar';

defineOptions({
  name: 'AppTabsBar',
});
const { barsList, activeTabFullPath } = tabsBar();
</script>

<style lang="scss" scoped>
.tabs-bar {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  box-sizing: border-box;
  margin-top: var(--plt-basic-margin-s);
  height: 36px;
  &-box {
    flex: 1;
    overflow: hidden;
    transform: translateX(0px);
    position: relative;

    &:before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      border-bottom: 1px solid var(--plt-basic-border-color-main);
    }
  }
  &-list {
    transition: all 0.3s;
    display: flex;
    flex-wrap: nowrap;
    height: 100%;
  }
  &-item {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    border-bottom: 0;
    border-radius: 4px 4px 0 0;
    padding: 0 32px;
    cursor: pointer;

    &:hover {
      color: var(--plt-basic-color-primary-16);
      border-color: var(--plt-basic-border-color-main);
      background: linear-gradient(
        180deg,
        var(--plt-basic-bg-color-16-gray),
        rgb(var(--plt-basic-bg-color-rgb))
      );
    }
  }
  &-item-active {
    color: var(--plt-basic-color-primary-16);
    border-color: var(--plt-basic-border-color-main);
    background: linear-gradient(
      180deg,
      var(--plt-basic-bg-color-16-gray),
      rgb(var(--plt-basic-bg-color-rgb))
    );
  }
}
</style>
