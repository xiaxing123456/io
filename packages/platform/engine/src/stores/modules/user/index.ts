import { PiniaName } from '@engine/stores/index.enum';

import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';

export const useAccessStore = defineStore(PiniaName.User, () => {
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
