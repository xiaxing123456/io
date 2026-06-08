import tailwindcss from '@tailwindcss/postcss';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import autoprefixer from 'autoprefixer';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

/** 是否是生产环境 */
const isEnvProduction = process.env.NODE_ENV === 'production';

const envFiles = [`.env`, `.env.${process.env.NODE_ENV}`];

// 根据文件名获取对应的环境变量
envFiles.forEach(file => {
    const envConfig = dotenv.parse(readFileSync(`${__dirname}/${file}`));
    Object.keys(envConfig).forEach(k => {
        process.env[k] = envConfig[k];
    });
});

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueJsx()],
    resolve: {
        alias: {
            '@engine': fileURLToPath(new URL('./src', import.meta.url)),
            '@locales': fileURLToPath(
                new URL('../../../node_modules/@io-platform/locales/src', import.meta.url)
            ),
            '@core-composables': fileURLToPath(
                new URL('../../../node_modules/@io-platform/core-composables/src', import.meta.url)
            ),
        },
    },
    base: './',
    server: {
        host: process.env.VITE_HOST || '127.0.0.1',
        port: +(process.env.VITE_PORT || 3000), // 设置服务启动端口号
        open: process.env.VITE_OPEN_BROWSER === 'on', // 设置服务启动时是否自动打开浏览器
        cors: true, // 允许跨域
        proxy: {
            // 接口代理
            [process.env.VITE_BASE_URL]: {
                target: process.env.VITE_PROXY_URL,
                changeOrigin: true,
                rewrite: path => path.replace(new RegExp(`^${process.env.VITE_BASE_URL}`), ''),
            },
        },
    },
    css: {
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
    build: {
        sourcemap: !isEnvProduction,
        cssCodeSplit: true,
    },
});
