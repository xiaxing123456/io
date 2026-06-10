import type { DirectiveBinding, ObjectDirective } from 'vue';
import { instanceName } from './constants';
import Loading from './index';
import type { LoadingInstance } from './plt-loading.types';

/** 带有 loading 实例缓存的指令元素。 */
export interface ElementLoading extends HTMLElement {
  PltLoading?: LoadingInstance;
}

const directiveInstanceMap = new WeakMap<HTMLElement, LoadingInstance>();

/** 根据 v-pltLoading 指令 binding 创建 loading 实例。 */
const createDirectiveInstance = (element: ElementLoading, binding: DirectiveBinding<boolean>) => {
  const previousInstance = directiveInstanceMap.get(element);

  previousInstance?.close();

  const instance = Loading({
    target: binding.modifiers.fullscreen ? document.body : element,
    fullscreen: !!binding.modifiers.fullscreen,
    body: !!binding.modifiers.body,
  });

  directiveInstanceMap.set(element, instance);
  element[instanceName] = instance;
};

/** 清理指令元素上的 loading 实例。 */
const closeDirectiveInstance = (element: ElementLoading) => {
  directiveInstanceMap.get(element)?.close();
  directiveInstanceMap.delete(element);
  delete element[instanceName];
};

/** Vue 指令：把布尔值变化转换成 loading 创建和关闭。 */
const vLoading: ObjectDirective<ElementLoading, boolean> = {
  mounted(element, binding) {
    if (binding.value) {
      createDirectiveInstance(element, binding);
    }
  },

  updated(element, binding) {
    if (binding.oldValue === binding.value) {
      return;
    }

    if (binding.value) {
      createDirectiveInstance(element, binding);
      return;
    }

    closeDirectiveInstance(element);
  },

  unmounted(element) {
    closeDirectiveInstance(element);
  },
};

export default vLoading;
export { vLoading };
