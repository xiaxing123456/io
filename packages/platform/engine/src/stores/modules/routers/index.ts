import { PiniaName } from '@engine/stores/index.enum';

import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import { RouteRecordRaw } from 'vue-router';

/**
 * 路由数据存储
 */
export const routersStore = defineStore(PiniaName.Routers, () => {
    /** 数据 */
    const state = reactive({
        routeRecordRaw: [] as AnyObj[],
    });
    /** 方法 */
    const actions = {
        setRouteRecordRaw(routes: RouteRecordRaw[]) {
            state.routeRecordRaw = routes;
        },
    };
    return {
        ...toRefs(state),
        ...actions,
    };
});
