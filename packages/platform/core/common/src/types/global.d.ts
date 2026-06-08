import { Ref } from 'vue';

declare global {
    interface AnyObj {
        [key: string]: any;
        [key: number]: any;
    }

    interface ObjectOptions<T> {
        [key: string]: T;
        [key: number]: T;
    }

    interface BaseModelApiOptions {
        server: string;
        module: string;
    }

    type MaybeRef<T> = Ref<T> | T;

    type Nullable<T> = T | null;

    // auth need data
    /** 接口请求参数需要默认额外的参数（开发人员按需使用） */
    interface RequestDefaultDataOptions {
        /** 以供服务端处理权限和区分shell begin */

        /** 取路由的pathID, 如果是父级导航生成的导航, 取父级导航的path */
        shellId?: string;
        /** 一般情况下取路由的shellId, 在外壳程序目录下, 特殊处理 */
        pathId?: string;

        /** 以供服务端处理权限和区分shell end */
    }

    const logger: {
        log: (...args: any[]) => void;
        info: (...args: any[]) => void;
        warn: (...args: any[]) => void;
        error: (...args: any[]) => void;
    };

    interface Window {
        logger: logger;
        /** 系统代理别名，挂载到全局，给其他插件使用 */
        DMS_PIMC_PROXY_NAME: string;
    }
    // eslint-disable-next-line vars-on-top, no-var
    var DMS_I18N_INSTANCES: AnyObj;
}

export {};
