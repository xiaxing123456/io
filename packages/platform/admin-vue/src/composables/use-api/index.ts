import type { AsyncFunction, UseApiOptions } from '@admin-vue/composables/use-api/index.types';
import type { LoadingInstance } from '@io-platform/core-ui/src/components/plt-loading';
import type { Ref } from 'vue';

import { UseApiAbortController } from '@admin-vue/composables/use-api/UseApiAbortController';
import { PltLoading } from '@io-platform/core-ui/src/components/plt-loading';
import { isRef, ref } from 'vue';

export const useApiDefaultProps = {
  showLoading: true,
  iconVisible: true,
  stepVisible: false,
  debounce: true,
  recordCancelTask: true,
};

export const useApi = (
  sourceFn: AsyncFunction,
  el: Ref<HTMLElement> | HTMLElement | string | undefined,
  options: UseApiOptions = useApiDefaultProps
) => {
  let wrappedFn;

  const loading = ref(false);
  const loadingInstance = ref<LoadingInstance | null>(null);
  const result = ref();
  const error = ref();

  const useApiAbortController = new UseApiAbortController({
    recordCancelTask: options?.recordCancelTask ?? true,
  });
  useApiAbortController.registerCancelTask();

  /** 获取资源 */
  const fetchResource = async (...args: any[]) => {
    const { showLoading, debounce } = Object.assign({}, useApiDefaultProps, options);

    // 防抖
    if (loading.value && debounce) return Promise.resolve();
    loading.value = true;

    // 显示 loading
    if (showLoading) {
      loadingInstance.value = PltLoading.service({
        target: isRef(el) ? el.value : el,
      });
    }

    try {
      // 触发取消任务
      const taskId = useApiAbortController.checkCancellation();
      // 包装目标函数, 确保可以被取消
      wrappedFn = useApiAbortController.withAbortFn(sourceFn);
      // 调用被包装后的方法
      const data = await wrappedFn.call(null, ...args);
      result.value = data;
      useApiAbortController.resetCancelTask(taskId);
      return Promise.resolve(data);
    } catch (e) {
      error.value = e;
      return Promise.reject(e);
    } finally {
      showLoading && loadingInstance.value?.close();
      loading.value = false;
    }
  };

  return {
    fetchResource,
  };
};
