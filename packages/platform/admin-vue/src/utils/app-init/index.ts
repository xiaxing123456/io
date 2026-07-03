import type { App } from 'vue';

import { setupI18n } from '@admin-vue/i18n';
import { initRouter } from '@admin-vue/router';
import { initStores } from '@admin-vue/stores';
import { envVariables } from '@admin-vue/utils/env-var';

import { VxeUIBase, VxeUITable } from '@admin-vue/utils/resources/vxe-table';
import { platformUIComponents } from '@io-platform/core-ui/src';
import ElementPlus from 'element-plus';

export const initApp = async (app: App) => {
  const { name, version, isDev } = envVariables;
  const env = isDev ? 'dev' : 'prod';
  const namespace = `${name}-${version}-${env}`;

  //  全局注册组件
  app.use(ElementPlus);
  app.use(VxeUITable);
  app.use(VxeUIBase);
  [...platformUIComponents].forEach(component => {
    // 兼容setup语法 使用defineOptions导出的组件name
    app.component(component.name || component?.customOptions?.name, component);
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, { namespace });

  // 配置 路由
  await initRouter(app);
  return app;
};
