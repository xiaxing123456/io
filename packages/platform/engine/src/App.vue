<template>
    <el-config-provider>
        <router-view></router-view>
    </el-config-provider>
</template>

<script setup lang="ts"></script>

<style scoped>
#app {
    width: 100%;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: var(--plt-basic-font-size-common);
    color: var(--plt-basic-color-text-minor-dark);
}
</style>
