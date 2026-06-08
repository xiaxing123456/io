<template>
    <div
        class="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950"
    >
        <!-- 背景动画 -->
        <animate-background></animate-background>

        <div
            class="max-w-250 w-full grid grid-cols-1 lg:grid-cols-2 glass rounded-3xl overflow-hidden shadow-2xl relative z-10 duration-500"
        >
            <!-- 左侧：品牌与信息 -->
            <div
                class="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-blue-600/20 border-r border-slate-700/30"
            >
                <div>
                    <div class="flex items-center gap-3 mb-8">
                        <div class="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/40">
                            <!-- <Gamepad2 size="{28}" class="text-white" /> -->
                        </div>
                        <h1 class="text-2xl font-bold text-white tracking-tight">
                            GAMEHUB <span class="text-blue-400">DEV</span>
                        </h1>
                    </div>
                    <h2 class="text-4xl font-bold text-white mb-6 leading-tight">
                        连接每一个<br />
                        <span
                            class="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400"
                        >
                            游戏灵感。
                        </span>
                    </h2>
                    <p class="text-slate-400 text-lg mb-8 max-w-sm">
                        发布你的网页游戏分发包，分享实战视频教程，在开发者社区建立你的作品集。
                    </p>

                    <div class="space-y-6">
                        <div class="flex items-center gap-4 group">
                            <div
                                class="p-3 rounded-full bg-slate-800/50 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all"
                            >
                                <plt-icon
                                    icon="icon-kongjian_bold"
                                    class="text-blue-400 group-hover:text-white w-6"
                                ></plt-icon>
                            </div>
                            <div>
                                <h4 class="text-slate-200 font-medium">作品托管</h4>
                                <p class="text-slate-500 text-sm">高速分发 WebGL/HTML5 游戏包</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 group">
                            <div
                                class="p-3 rounded-full bg-slate-800/50 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all"
                            >
                                <plt-icon
                                    icon="icon-quanjushitu_Light"
                                    class="text-emerald-400 group-hover:text-white w-6"
                                ></plt-icon>
                            </div>
                            <div>
                                <h4 class="text-slate-200 font-medium">教程分享</h4>
                                <p class="text-slate-500 text-sm">内置高清视频播放器与文档支持</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 group">
                            <div
                                class="p-3 rounded-full bg-slate-800/50 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all"
                            >
                                <plt-icon
                                    icon="icon-code"
                                    class="text-amber-400 group-hover:text-white w-6"
                                ></plt-icon>
                            </div>
                            <div>
                                <h4 class="text-slate-200 font-medium">开发者资源</h4>
                                <p class="text-slate-500 text-sm">获取最新的开源框架与资产</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-slate-500 text-sm mt-20">
                    © 2024 GameHub Dev 开发者门户 | 让创作更简单
                </div>
            </div>
            <!-- 右侧：登录表单 -->
            <div class="bg-slate-900/40 p-8 lg:p-14 flex flex-col justify-center">
                <div class="mb-10">
                    <h3 class="text-2xl font-bold text-white mb-2">
                        <!-- 欢迎回来 -->
                        {{ $t('login.welcomeBack') }}
                    </h3>
                    <p class="text-slate-400 text-sm">
                        <!-- 立即登录以管理您的游戏项目和教程 -->
                        {{ $t('login.subtitle') }}
                    </p>
                </div>
                <el-form ref="formRef" label-position="top" class="login-form" :model="formData">
                    <!-- 用户名/手机号 -->
                    <el-form-item :label="$t('login.usernameLabel')">
                        <el-input
                            v-model="formData.username"
                            :placeholder="$t('login.usernamePlaceholder')"
                        ></el-input>
                    </el-form-item>
                    <!-- 密码 -->
                    <el-form-item :label="$t('login.passwordLabel')">
                        <el-input
                            v-model="formData.password"
                            type="password"
                            :placeholder="$t('login.passwordPlaceholder')"
                            show-password
                        ></el-input>
                    </el-form-item>
                </el-form>

                <el-button type="primary" @click="submitLogin">
                    <!-- 立即登录 -->
                    {{ $t('login.loginButton') }}
                </el-button>

                <!-- 社交登录 -->
                <div class="mt-10">
                    <div class="relative flex items-center justify-center mb-6">
                        <div class="absolute w-full border-t border-slate-700/50"></div>
                        <span
                            className="relative px-4 bg-slate-900 text-slate-500 text-xs uppercase tracking-widest"
                        >
                            <!-- 第三方快捷登录 -->
                            {{ $t('login.thirdPartyLogin') }}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <el-button type="default">
                            <plt-icon icon="icon-github" color="#2fc6f4" class="pr-2"></plt-icon>
                            GitHub
                        </el-button>
                        <el-button type="default">
                            <plt-icon icon="icon-wechat" color="#29ce74" class="pr-2"></plt-icon>
                            WeChat
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer Mobile Only -->
        <div className="absolute bottom-6 text-slate-600 text-[10px]">
            © 2024 GameHub Dev | 基于 WebGL 技术构建
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRSAEncrypt } from '@core-composables/use-rsa-encrypt';
import AnimateBackground from '@engine/views/login/animate-background.vue';
import { $t } from '@locales';
import { reactive, ref } from 'vue';

const { encrypt } = useRSAEncrypt();

const formRef = ref();
const formData = reactive({
    username: '',
    password: '',
});

/** 用户登录 */
const submitLogin = async () => {
    try {
        await formRef.value.validate();
        loginHandler(formData.username, formData.password);
    } catch (error) {
        logger.error(error);
    }
    formRef.value.validate((valid: boolean) => {
        if (!valid) return;
    });
};

/** 正式环境登录处理 */
const loginHandler = async (user: string, password: string) => {
    const { encrypted } = await encrypt(password);
    let dataParams = {
        user,
        pwd: encrypted,
        encrypt: 1,
    };

    // 采用导航守卫跳转
    window.location.reload();
};
</script>

<style lang="scss" scoped>
.login-form {
    :deep(.el-input__wrapper) {
        background-color: transparent;
        .el-input__inner {
            color: #fff;
        }
    }
}
</style>
