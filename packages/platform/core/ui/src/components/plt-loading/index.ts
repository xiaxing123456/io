import type { App } from 'vue';
import LoadingService from './src';
import loadingDirective from './src/directive';

/** PltLoading 插件入口：注册指令并暴露 service。 */
const PltLoading = {
    install(app: App) {
        app.directive('pltLoading', loadingDirective);
    },
    service: LoadingService,
};

export default PltLoading;
export { PltLoading };
export type {
    LoadingInstance,
    LoadingOptions,
    LoadingParentElement,
    LoadingTarget,
} from './src/plt-loading.types';
