/** Loading 父元素定位 class，让 ::after 可以相对 parent 定位。 */
export const loadingRelativeClass = 'plt-loading-parent--relative';

/** Loading 遮罩触发 class，SCSS 通过它显示 ::after。 */
export const loadingWrapClass = 'plt-loading_wrap';

/** 锁滚动 class，需要配合 SCSS overflow hidden 才生效。 */
export const loadingHiddenClass = 'plt-loading-parent--hidden';

/** parent 上保存 loading 引用计数的属性名。 */
export const loadingNumberAttribute = 'loading-number';

/** parent 上保存旧 z-index 的属性名。 */
export const oldZIndexAttribute = 'old-z-index';

/** 普通局部 loading 的默认层级。 */
export const defaultZIndex = '101';

/** 缓存在 DOM 元素上的 loading 实例属性名。 */
export const instanceName = 'PltLoading';
