import replace from '@rollup/plugin-replace';
import { writeFile } from 'fs/promises';
import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import { fileURLToPath } from 'url';

/**
 * ESM 等价实现：__filename / __dirname
 */
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(__filename);

/**
 * 生成 package.json 的 Rollup 插件
 * @param {Object} options - 插件选项
 * @param {string} options.outputDir - 输出目录
 * @param {'module' | 'commonjs'} options.moduleType - 模块类型
 */
function generatePackageJson({ outputDir, moduleType }) {
    return {
        name: 'generate-package-json',
        async writeBundle() {
            const packageJsonPath = path.resolve(__dirname, outputDir, 'package.json');
            const packageJsonContent = {
                type: moduleType,
            };
            try {
                await writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
                console.log(`Generated ${packageJsonPath} with type: ${moduleType}`);
            } catch (error) {
                console.error(`Failed to generate ${packageJsonPath}:`, error);
            }
        },
    };
}

/**
 * 外部依赖列表（不打包进产物）
 */
const externalDependencies = [
    'tslib',
    // 运行时依赖
    'qs',
    'mathjs',
    'lodash', // CJS 构建使用 lodash 而非 lodash-es
    'lodash-es', // ESM 构建保留 lodash-es
    'dayjs',
    'dayjs/plugin/utc',
    'dayjs/plugin/timezone',
    // Vue 生态
    'vue',
    'vue-router',
    'vue-demi',
    'vue-i18n',
    'pinia',
];

/**
 * Rollup 配置（针对 esm 和 cjs 输出）
 */
export default [
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist/esm',
            format: 'esm',
            preserveModules: true,
            sourcemap: false,
        },
        plugins: [
            esbuild({
                target: 'esnext',
                sourceMap: false,
                tsconfig: path.resolve(__dirname, 'tsconfig.json'),
            }),
            generatePackageJson({
                outputDir: 'dist/esm',
                moduleType: 'module',
            }),
        ],
        external: externalDependencies,
        watch: {
            include: 'src/**',
            exclude: 'node_modules/**',
        },
    },
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist/cjs',
            format: 'cjs',
            preserveModules: true,
            sourcemap: false,
        },
        plugins: [
            esbuild({
                target: 'es2015',
                sourceMap: false,
                tsconfig: path.resolve(__dirname, 'tsconfig.json'),
            }),
            replace({
                preventAssignment: true,
                delimiters: ['', ''],
                values: {
                    "require('lodash-es')": "require('lodash')",
                    'require("lodash-es")': 'require("lodash")',
                },
            }),
            generatePackageJson({
                outputDir: 'dist/cjs',
                moduleType: 'commonjs',
            }),
        ],
        external: externalDependencies,
        watch: {
            include: 'src/**',
            exclude: 'node_modules/**',
        },
    },
];
