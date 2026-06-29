export const getStyle = (targetElement: HTMLElement, styleKey: string) => {
  return getComputedStyle(targetElement, null).getPropertyValue(styleKey);
};

/** 字符串分组 */
export const trimArr = function (s: string) {
  return (s || '').split(' ').filter(item => !!item.trim());
};

/**
 * 添加class
 * @param el 目标元素
 * @param cls 类名
 */
export const addClass = (el: HTMLElement | Element, cls: string): void => {
  if (!el) return;
  let className = el.getAttribute('class') || '';
  const curClass = trimArr(className);
  const classes = (cls || '').split(' ').filter(item => !curClass.includes(item) && !!item.trim());

  if (el.classList) {
    el.classList.add(...classes);
  } else {
    className += ` ${classes.join(' ')}`;
    el.setAttribute('class', className);
  }
};

/**
 * 移除class
 * @param el 目标元素
 * @param cls 类名
 */
export const removeClass = (el: HTMLElement | Element, cls: string): void => {
  if (!el || !cls) return;
  const classes = trimArr(cls);
  let curClass = el.getAttribute('class') || '';

  if (el.classList) {
    el.classList.remove(...classes);
    return;
  }
  classes.forEach(item => {
    curClass = curClass.replace(` ${item} `, ' ');
  });

  const className = trimArr(curClass).join(' ');
  el.setAttribute('class', className);
};

/** 标签可容纳内容宽度 */
export const getElContentWidth = (targetElement: HTMLElement) => {
  const padding =
    parseInt(getStyle(targetElement, 'padding-left'), 10) +
    parseInt(getStyle(targetElement, 'padding-right'), 10);
  const border =
    parseInt(getStyle(targetElement, 'border-left'), 10) +
    parseInt(getStyle(targetElement, 'border-right'), 10);

  return targetElement.getBoundingClientRect().width - padding - border;
};
