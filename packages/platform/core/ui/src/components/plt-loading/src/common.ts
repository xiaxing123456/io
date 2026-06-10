export const trimArr = function (s: string) {
  return (s || '').split(' ').filter(item => !!item.trim());
};

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
