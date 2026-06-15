import { defineConfig } from 'vitepress';

const docsName = process.env.VITE_DOCS_NAME || 'doc-ui';
const docsVersion = process.env.VITE_DOCS_VERSION || 'v1.0.0';
const base = `/io/${docsName}/${docsVersion}/`;

export default defineConfig({
  title: process.env.VITE_DOCS_TITLE || 'Core UI 组件文档',
  description: process.env.VITE_DOCS_DESC || '@io-platform/core-ui component documentation',
  base,
  assetsDir: 'static',
  outDir: './dist',
  themeConfig: {
    search: {
      provider: 'local',
    },
    outline: [2, 4],
    outlineTitle: '导览',
    docFooter: { prev: '上一篇', next: '下一篇' },
    nav: [
      { text: '首页', link: '/' },
      { text: '组件文档', link: '/#组件总览' },
    ],
    sidebar: [
      {
        text: '@io-platform/core-ui',
        items: [
          { text: '组件总览', link: '/' },
          { text: 'PltIcon', link: '/#plticon-图标组件' },
          { text: 'PltLoading', link: '/#pltloading-loading-组件' },
          { text: 'pltMenu', link: '/#pltmenu-虚拟树形菜单' },
          { text: 'PltObserverItem', link: '/#pltobserveritem-尺寸观测项' },
          { text: 'pltTree', link: '/#plttree-树形控件' },
          { text: 'PltVirtuallyList', link: '/#pltvirtuallylist-虚拟列表' },
        ],
      },
    ],
    socialLinks: [],
  },
});
