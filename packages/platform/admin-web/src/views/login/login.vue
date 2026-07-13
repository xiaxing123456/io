<template>
  <div class="login-container">
    <el-form class="login-form" ref="loginFromRef" :model="loginForm">
      <div class="title-container">
        <h3 class="title">{{ $t('admin-web.login_page.title') }}</h3>
      </div>

      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" placeholder="username">
          <template #prefix>
            <plt-icon icon="icon-plt-icon-user"></plt-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="password">
          <template #prefix>
            <plt-icon icon="icon-plt-icon-lock"></plt-icon>
          </template>
          <template #suffix>
            <plt-icon icon="icon-plt-icon-view" @click=""></plt-icon>
            <plt-icon icon="icon-plt-icon-view_off" @click=""></plt-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-button type="primary" style="width: 100%; margin-bottom: 30px">
        {{ $t('admin-web.login_page.login') }}
      </el-button>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 数据源
const loginForm = ref({
  username: '',
  password: '',
});
const passwordType = ref('password');
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
$cursor: #fff;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;

    ::v-deep .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }

    ::v-deep .el-input {
      display: inline-flex;
      height: 47px;

      input {
        background: transparent;
        border: 0px;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;
      }
    }
  }
}
</style>
