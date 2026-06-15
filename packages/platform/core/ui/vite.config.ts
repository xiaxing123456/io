import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const externalDependencies = [
  '@element-plus/icons-vue',
  '@io-platform/core-common',
  '@vueuse/core',
  'element-plus',
  'lodash-es',
  'sortablejs',
  'vue',
  'vue-router',
  'vxe-table',
  'xe-utils',
];

const isExternal = (id: string) =>
  externalDependencies.some(packageName => id === packageName || id.startsWith(`${packageName}/`));

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'components/index': fileURLToPath(new URL('./src/components/index.ts', import.meta.url)),
        'components/plt-loading/index': fileURLToPath(
          new URL('./src/components/plt-loading/index.ts', import.meta.url)
        ),
      },
      formats: ['es', 'cjs'],
      cssFileName: 'style',
      fileName: (format, entryName) =>
        `${format === 'es' ? 'esm' : 'cjs'}/${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: isExternal,
      output: {
        exports: 'named',
        assetFileNames: assetInfo =>
          assetInfo.names?.includes('style.css') || assetInfo.name === 'style.css'
            ? 'style.css'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
