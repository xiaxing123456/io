<template>
  <div ref="loginPageRef" class="login-page">
    <!-- 背景动画 -->
    <animate-background></animate-background>

    <div class="login-card">
      <!-- 左侧：品牌与信息 -->
      <div class="login-card__intro">
        <div>
          <div class="brand">
            <div class="brand__icon">
              <!-- <Gamepad2 size="{28}" class="text-white" /> -->
            </div>
            <h1 class="brand__title">GAMEHUB <span>DEV</span></h1>
          </div>
          <h2 class="intro-title">
            连接每一个<br />
            <span>游戏灵感。</span>
          </h2>
          <p class="intro-desc">
            发布你的网页游戏分发包，分享实战视频教程，在开发者社区建立你的作品集。
          </p>

          <div class="feature-list">
            <div class="feature-item feature-item--blue">
              <div class="feature-item__icon">
                <plt-icon icon="icon-kongjian_bold" class="feature-icon"></plt-icon>
              </div>
              <div>
                <h4>作品托管</h4>
                <p>高速分发 WebGL/HTML5 游戏包</p>
              </div>
            </div>
            <div class="feature-item feature-item--emerald">
              <div class="feature-item__icon">
                <plt-icon icon="icon-quanjushitu_Light" class="feature-icon"></plt-icon>
              </div>
              <div>
                <h4>教程分享</h4>
                <p>内置高清视频播放器与文档支持</p>
              </div>
            </div>
            <div class="feature-item feature-item--amber">
              <div class="feature-item__icon">
                <plt-icon icon="icon-code" class="feature-icon"></plt-icon>
              </div>
              <div>
                <h4>开发者资源</h4>
                <p>获取最新的开源框架与资产</p>
              </div>
            </div>
          </div>
        </div>
        <div class="intro-footer">© 2024 GameHub Dev 开发者门户 | 让创作更简单</div>
      </div>
      <!-- 右侧：登录表单 -->
      <div class="login-card__panel">
        <div class="login-header">
          <h3>
            <!-- 欢迎回来 -->
            {{ $t('login_page.welcomeBack') }}
          </h3>
          <p>
            <!-- 立即登录以管理您的游戏项目和教程 -->
            {{ $t('login_page.subtitle') }}
          </p>
        </div>
        <el-form
          ref="formRef"
          label-position="top"
          class="login-form"
          :model="formData"
          :rules="formRule"
        >
          <!-- 用户名/手机号 -->
          <el-form-item :label="$t('login_page.usernameLabel')" prop="username">
            <el-input
              v-model="formData.username"
              :placeholder="$t('login_page.usernamePlaceholder')"
            ></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item :label="$t('login_page.passwordLabel')" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              :placeholder="$t('login_page.passwordPlaceholder')"
              show-password
            ></el-input>
          </el-form-item>
          <!-- 验证码 -->
          <el-form-item :label="$t('login_page.codeLabel')" prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="formData.captcha"
                :placeholder="$t('login_page.codePlaceholder')"
              ></el-input>
              <div ref="captchaRef" class="captcha-image">
                <button type="button" :title="$t('login_page.refreshCaptcha')" @click="getCaptcha">
                  <img :src="captchaBase64" :alt="$t('login_page.codeLabel')" />
                </button>
              </div>
            </div>
          </el-form-item>
        </el-form>

        <el-button type="primary" @click="submitLogin">
          <!-- 立即登录 -->
          {{ $t('login_page.loginButton') }}
        </el-button>

        <!-- 社交登录 -->
        <div class="third-party-login">
          <div class="login-divider">
            <div class="login-divider__line"></div>
            <span>
              <!-- 第三方快捷登录 -->
              {{ $t('login_page.thirdPartyLogin') }}
            </span>
          </div>
          <div class="social-login-grid">
            <el-button type="default">
              <plt-icon icon="icon-github" color="#2fc6f4" class="social-login-icon"></plt-icon>
              GitHub
            </el-button>
            <el-button type="default">
              <plt-icon icon="icon-wechat" color="#29ce74" class="social-login-icon"></plt-icon>
              WeChat
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Mobile Only -->
    <div class="mobile-footer">© 2024 GameHub Dev | 基于 WebGL 技术构建</div>
  </div>
</template>

<script lang="ts" setup>
import { generateValidateCode } from '@admin-vue/apis/login';
import { useApi } from '@admin-vue/composables/use-api';
import { useRSAEncrypt } from '@admin-vue/composables/use-rsa-encrypt';
import { $t } from '@admin-vue/i18n';
import { userAccessStore } from '@admin-vue/stores';
import AnimateBackground from '@admin-vue/views/login/animate-background.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const { encrypt } = useRSAEncrypt();
const userAccess = userAccessStore();

const loginPageRef = ref();
const formRef = ref();
const captchaRef = ref();
const captchaBase64 = ref('');
const formData = reactive({
  username: '',
  password: '',
  captcha: '',
  codeKey: '',
});

const formRule = reactive({
  username: [
    { required: true, message: $t('message.span_error_placeholder_input'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: $t('message.span_error_placeholder_input'), trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: $t('message.span_error_placeholder_input'), trigger: 'blur' },
  ],
});

/** 用户登录 */
const submitLogin = useApi(async () => {
  try {
    await formRef.value.validate();

    const { encrypted } = await encrypt(formData.password);
    const params = {
      userName: formData.username,
      password: encrypted,
      captcha: formData.captcha,
      codeKey: formData.codeKey,
    };
    await userAccess.login(params);
    router.push('/');
  } catch (error) {
    logger.error(error);
  }
}, loginPageRef).fetchResource;

/** 获取或者更新验证码 */
const getCaptcha = useApi(async () => {
  try {
    const { data } = await generateValidateCode();
    captchaBase64.value = data.codeValue;
    formData.codeKey = data.codeKey;
  } catch (error) {
    logger.error(error);
  }
}, captchaRef).fetchResource;

onMounted(async () => {
  await getCaptcha();
});
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  overflow: hidden;
  background: #020617;
}

.login-card {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  max-width: 1000px;
  overflow: hidden;
  border-radius: 24px;
  box-shadow:
    0 25px 50px -12px rgb(0 0 0 / 0.25),
    inset 0 1px 0 rgb(255 255 255 / 0.08);
  transition-duration: 0.5s;
}

.login-card__intro {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  background: linear-gradient(135deg, rgb(37 99 235 / 0.2), transparent);
  border-right: 1px solid rgb(51 65 85 / 0.3);
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 32px;
}

.brand__icon {
  width: 44px;
  height: 44px;
  padding: 8px;
  background: #3b82f6;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgb(59 130 246 / 0.4);
}

.brand__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  color: #fff;
  letter-spacing: -0.025em;

  span {
    color: #60a5fa;
  }
}

.intro-title {
  margin: 0 0 24px;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.25;
  color: #fff;

  span {
    color: transparent;
    background: linear-gradient(90deg, #60a5fa, #34d399);
    background-clip: text;
  }
}

.intro-desc {
  max-width: 384px;
  margin: 0 0 32px;
  font-size: 18px;
  line-height: 28px;
  color: #94a3b8;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  gap: 16px;
  align-items: center;

  h4 {
    margin: 0;
    font-weight: 500;
    color: #e2e8f0;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: #64748b;
  }
}

.feature-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 12px;
  color: var(--feature-color);
  background: rgb(30 41 59 / 0.5);
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.feature-icon {
  font-size: 24px;
  color: var(--feature-color);
  transition: color 0.2s ease;
}

.feature-item--blue {
  --feature-color: #60a5fa;
  --feature-hover-bg: #3b82f6;
}

.feature-item--emerald {
  --feature-color: #34d399;
  --feature-hover-bg: #10b981;
}

.feature-item--amber {
  --feature-color: #fbbf24;
  --feature-hover-bg: #f59e0b;
}

.feature-item:hover {
  .feature-item__icon {
    color: #fff;
    background: var(--feature-hover-bg);
  }

  .feature-icon {
    color: #fff;
  }
}

.intro-footer {
  margin-top: 80px;
  font-size: 14px;
  line-height: 20px;
  color: #64748b;
}

.login-card__panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px;
  background: rgb(15 23 42 / 0.4);
}

.login-header {
  margin-bottom: 40px;

  h3 {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: #94a3b8;
  }
}

.login-form {
  :deep(.el-form-item__label) {
    color: #cbd5e1;
  }

  :deep(.el-input__wrapper) {
    background-color: transparent;

    .el-input__inner {
      color: #fff;
    }
  }
}

.captcha-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-image {
  display: flex;
  flex: 0 0 112px;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: rgb(15 23 42 / 0.65);
  border: 1px solid rgb(148 163 184 / 0.24);
  border-radius: 4px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
  }

  &:hover {
    border-color: #60a5fa;
    box-shadow: 0 0 0 1px rgb(96 165 250 / 0.18);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
}

.third-party-login {
  margin-top: 40px;
}

.login-divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  span {
    position: relative;
    padding: 0 16px;
    font-size: 12px;
    line-height: 16px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: #0f172a;
  }
}

.login-divider__line {
  position: absolute;
  width: 100%;
  border-top: 1px solid rgb(51 65 85 / 0.5);
}

.social-login-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.social-login-icon {
  padding-right: 8px;
}

.mobile-footer {
  position: absolute;
  bottom: 24px;
  font-size: 10px;
  line-height: 16px;
  color: #475569;
}

@media (width >= 1024px) {
  .login-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .login-card__intro {
    display: flex;
  }

  .login-card__panel {
    padding: 56px;
  }
}
</style>
