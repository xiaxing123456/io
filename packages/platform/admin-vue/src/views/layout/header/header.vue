<template>
  <div class="header">
    <div class="header-left"></div>
    <div class="header-center"></div>
    <div class="header-right">
      <user-avatar-button></user-avatar-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import UserAvatarButton from '@admin-vue/views/layout/header/components/user-avatar-button/user-avatar-button.vue';
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 50px;
  padding: 0 var(--plt-basic-padding-l);

  .header-center {
    flex: 1;
  }
}
</style>
