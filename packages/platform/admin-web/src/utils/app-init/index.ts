import type { App } from 'vue';

import { setupI18n } from '@admin-web/i18n';
import { initRouter } from '@admin-web/router';
import { initStores } from '@admin-web/stores';
import { envVariables } from '@admin-web/utils/env-var';

// element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// vxe-table
import VxeUITable from 'vxe-table';
import 'vxe-table/lib/style.css';

// vxe-ui
import VxeUIBase from 'vxe-pc-ui';
import 'vxe-pc-ui/es/style.css';
// 引入平台UI组件
import { platformUIComponents } from '@io-platform/core-ui/src';

import '@admin-web/assets/style/index.scss';

export const initApp = async (app: App) => {
  const { name, version, isDev } = envVariables;
  const env = isDev ? 'dev' : 'prod';
  const namespace = `${name}-${version}-${env}`;

  // 国际化 i18n 配置
  await setupI18n(app);

  //  全局注册组件
  app.use(ElementPlus);
  app.use(VxeUITable);
  app.use(VxeUIBase);
  [...platformUIComponents].forEach(component => {
    // 兼容setup语法 使用defineOptions导出的组件name
    app.component(component.name || component?.customOptions?.name, component);
  });

  // 配置 pinia-store
  await initStores(app, { namespace });

  // 配置路由
  initRouter(app);
  return app;
};
