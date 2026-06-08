import type { CreateElement, CreateElementOptions } from './index.types';

/**
 * 获取弹框 wrapper 的层级值。
 * 优先使用组件写入的 inline z-index，兜底读取计算样式。
 */
const getElementZIndex = (el: HTMLElement) => {
    const inlineZIndex = Number(el.style.zIndex);
    if (!Number.isNaN(inlineZIndex)) {
        return inlineZIndex;
    }

    const computedZIndex = Number(window.getComputedStyle(el).zIndex);
    return Number.isNaN(computedZIndex) ? -1 : computedZIndex;
};

/**
 * 从候选弹框中找出当前层级最高的 wrapper。
 * 若 z-index 相同，则优先返回 DOM 中后出现的弹框，避免命中旧弹框。
 */
const getTopDialogWrapper = (selector: string) => {
    const wrappers = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(wrapper =>
        wrapper.querySelector('.vxe-modal--box')
    );

    let topWrapper: HTMLElement | undefined;
    let topWrapperIndex = -1;
    let topWrapperZIndex = -1;

    wrappers.forEach((wrapper, index) => {
        const currentZIndex = getElementZIndex(wrapper);
        if (
            currentZIndex > topWrapperZIndex ||
            (currentZIndex === topWrapperZIndex && index > topWrapperIndex)
        ) {
            topWrapper = wrapper;
            topWrapperIndex = index;
            topWrapperZIndex = currentZIndex;
        }
    });

    return topWrapper;
};

export const createElment = (elName: string, options: CreateElementOptions) => {
    const el = document.createElement(elName);
    if (options && Object.keys(options).length) {
        const { innerHtml, innerText, attribute } = options;
        Object.assign(el, {
            innerHtml,
            innerText,
        });

        attribute &&
            Object.keys(attribute).forEach(attr => {
                el.setAttribute(attr, attribute[attr]);
            });
    }

    return el;
};

export const appendElement: CreateElement = (elName, appendEl, options) => {
    const el = document.createElement(elName);

    if (options && Object.keys(options).length) {
        const { innerHtml, innerText, attribute } = options;
        Object.assign(el, {
            innerHtml,
            innerText,
        });

        attribute &&
            Object.keys(attribute).forEach(attr => {
                el.setAttribute(attr, attribute[attr]);
            });
    }

    appendEl.append(el);

    return el;
};

/**
 * 获取当前可操作的弹框内容容器。
 * 优先返回已激活且已显示的最高层弹框；若处于显示过渡态，则降级到已激活弹框。
 */
export const getActiveDialogSubBox = () => {
    // 优先命中当前已显示完成的最高层弹框。
    const activeVisibleWrapper = getTopDialogWrapper('.vxe-modal--wrapper.is--active.is--visible');
    // 兜底兼容显示过渡中的弹框场景。
    const activeWrapper =
        activeVisibleWrapper || getTopDialogWrapper('.vxe-modal--wrapper.is--active');

    return activeWrapper?.querySelector<HTMLElement>('.vxe-modal--box') || undefined;
};

export type { CreateElement, CreateElementOptions };
