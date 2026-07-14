<template>
  <div class="login-container">
    <el-form class="login-form" ref="formRef" :model="formData">
      <div class="title-container">
        <h3 class="title">{{ t('login_page.title') }}</h3>
      </div>

      <!-- 账户 -->
      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          type="text"
          :placeholder="t('message.placeholder.span_input')"
        >
          <template #prefix>
            <plt-icon icon="icon-plt-icon-user"></plt-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码 -->
      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          :type="passwordType"
          :placeholder="t('message.placeholder.span_input')"
        >
          <template #prefix>
            <plt-icon icon="icon-plt-icon-lock"></plt-icon>
          </template>
          <template #suffix>
            <plt-icon
              class="cursor-p"
              :icon="passwordType !== 'password' ? 'icon-plt-icon-view' : 'icon-plt-icon-view_off'"
              @click="changePwdType"
            ></plt-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 验证码 -->
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item prop="captcha">
            <el-input v-model="formData.captcha" :placeholder="t('message.placeholder.span_input')">
              <template #prefix>
                <plt-icon icon="icon-plt-icon-lock"></plt-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-button :loading="captchaButtonLoading" class="captch-button" @click="getCaptcha">
            <img :src="captchaBase64" :alt="$t('login_page.codeLabel')" />
          </el-button>
        </el-col>
      </el-row>

      <el-button type="primary" style="width: 100%; margin-bottom: 30px" @click="handleLogin">
        {{ t('login_page.login') }}
      </el-button>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { generateValidateCode } from '@admin-web/apis/users';
import { useApi } from '@admin-web/composables/use-api';
import { useRSAEncrypt } from '@admin-web/composables/use-rsa-encrypt';
import { t } from '@admin-web/i18n';
import { userAccessStore } from '@admin-web/stores/modules/user-access';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { encrypt } = useRSAEncrypt();
const userAccess = userAccessStore();

const formRef = ref();
const formData = reactive({
  username: '',
  password: '',
  captcha: '',
  codeKey: '',
});
const passwordType = ref('password');
const changePwdType = () => {
  passwordType.value = passwordType.value === 'password' ? 'text' : 'password';
};

const captchaButtonLoading = ref();
const captchaBase64 = ref('');
/** 获取或者更新验证码 */
const getCaptcha = useApi(
  async () => {
    try {
      if (captchaButtonLoading.value) return;
      captchaButtonLoading.value = true;
      const { data } = await generateValidateCode();
      captchaBase64.value = data.codeValue;
      formData.codeKey = data.codeKey;
    } catch (error) {
      logger.error(error);
    } finally {
      captchaButtonLoading.value = false;
    }
  },
  undefined,
  { showLoading: false }
).fetchResource;

const handleLogin = async () => {
  try {
    await formRef.value.validate();

    const { encrypted } = await encrypt(formData.password);
    const params = {
      accountName: formData.username,
      password: encrypted,
      captcha: formData.captcha,
      codeKey: formData.codeKey,
    };
    await userAccess.loginServer(params);
    router.push('/');
  } catch (error) {
    logger.error(error);
  }
};

onMounted(async () => {
  await getCaptcha();
});
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

    .captch-button {
      width: 100%;
      height: calc(100% - 18px);
      margin-bottom: 18px;
      padding: 0;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
