<template>
  <div class="tabs-bar-container tabs-bar">
    <div class="tabs-bar__box">
      <div class="tabs-bar__list">
        <div
          v-for="item in barsList"
          :key="item.fullPath"
          class="tabs-bar__item"
          :class="{ 'tabs-bar__item-active': isTabActive(item) }"
          @click="toggleBar(item)"
        >
          <div
            class="tabs-bar__item-dot"
            :class="{ 'tabs-bar__item-dot-active': isTabActive(item) }"
          ></div>
          <div class="tabs-bar__item-title">{{ item.title }}</div>
          <plt-icon
            v-if="item.closable !== false"
            class="tabs-bar__item-close"
            v-show="isTabActive(item)"
            icon="icon-plt-danchuang-guanbi_Light"
            @click.stop="closeBar(item)"
          ></plt-icon>
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
const { isTabActive, barsList, toggleBar, closeBar } = tabsBar();
</script>

<style lang="scss" scoped>
.tabs-bar {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  box-sizing: border-box;
  margin-top: var(--plt-basic-margin-s);
  height: 36px;
  &__box {
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
  &__list {
    transition: all 0.3s;
    display: flex;
    flex-wrap: nowrap;
    height: 100%;
  }
  &__item {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    border-bottom: 0;
    border-radius: 4px 4px 0 0;
    padding: 0 32px;
    cursor: pointer;
    &-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--plt-basic-color-primary-16);

      position: absolute;
      left: 12px;

      opacity: 0;
    }
    &-dot-active {
      opacity: 1;
    }
    &-close {
      position: absolute;
      right: 8px;
    }

    &:hover {
      color: var(--plt-basic-color-primary-16);
      border-color: var(--plt-basic-border-color-main);
      background: linear-gradient(
        180deg,
        var(--plt-basic-bg-color-16-gray),
        rgb(var(--plt-basic-bg-color-rgb))
      );
    }

    &:hover &-close {
      display: block !important;
    }
  }
  &__item-active {
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
