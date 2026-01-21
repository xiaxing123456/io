import type { App } from 'vue';

import { setupI18n } from '@engine/i18n';
import { initStores } from '@engine/stores';
import { envVariables } from '@engine/utils/env-var';

// 组件
import { platformUIComponents } from '@io-platform/ui';
import ElementPlus from 'element-plus';

export const initApp = async (app: App) => {
    const { name, version, isDev } = envVariables;
    const env = isDev ? 'dev' : 'prod';
    const namespace = `${name}-${version}-${env}`;

    //  全局注册组件
    app.use(ElementPlus);
    [...platformUIComponents].forEach(component => {
        // 兼容setup语法 使用defineOptions导出的组件name
        app.component(component.name || component?.customOptions?.name, component);
    });

    // 国际化 i18n 配置
    await setupI18n(app);
    // 配置 pinia-tore
    await initStores(app, { namespace });
    return app;
};
