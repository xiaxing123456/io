/**
 * 计算菜单的位置并返回调整后的 top 值、最大高度和是否需要滚动条。
 *
 * 如果菜单在给定的 `relativeTop` 位置无法完全展示，则向上调整。如果菜单高度超过
 * 视口高度，则设置为最大高度，并确保相对于父级元素的位置正确。如果超出父级容器高度，
 * 返回负的 top 值以使其向上显示。
 *
 * @param {Object} params - 参数对象。
 * @param {number} params.parentTop - 父级元素相对于视口的 top 值。
 * @param {number} params.relativeTop - 当前菜单相对于父级元素的偏移 top 值。
 * @param {number} params.elementHeight - 当前菜单的高度。
 * @param {number} [params.margin=10] - 元素与视口顶部和底部之间的最小边距（默认为10px）。
 *
 * @returns {{ top: number, maxHeight: number, needsScrollbar: boolean }}
 *   返回包含调整后的相对于父级元素的 top 值、菜单的最大高度和是否需要滚动条。
 *   - `top`: 当前菜单相对于父级元素的调整后 top 值，确保菜单可以在视口内显示。
 *   - `maxHeight`: 菜单的最大高度，如果菜单高度超出视口则调整，否则保持原高度。
 *   - `needsScrollbar`: 布尔值，如果元素高度等于或大于视口高度，则返回 true 表示需要滚动条。
 */
export function calculateMenuPosition({
    parentTop, // 父级元素相对于视口的 top 值
    relativeTop, // 当前元素相对于父级元素的偏移 top 值
    elementHeight, // 当前元素的高度
    margin = 10, // 元素与视口顶部和底部的最小边距
}: {
    parentTop: number;
    relativeTop: number;
    elementHeight: number;
    margin?: number;
}): { top: number; maxHeight: number; needsScrollbar: boolean } {
    // 获取视口高度
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // 计算元素的绝对 top 值（相对于视口）
    // const absoluteTop = parentTop + relativeTop;

    // 如果元素高度大于或等于视口高度，设置 maxHeight 为视口高度减去 margin，并设置 top 为负值
    if (elementHeight >= viewportHeight) {
        return {
            top: -parentTop + margin, // 向上调整，并确保留出 margin 空间
            maxHeight: viewportHeight - margin * 2, // 最大高度为视口高度减去上下的 margin
            needsScrollbar: true, // 高度大于视口，返回需要滚动条
        };
    }

    // 计算元素底部相对于视口的绝对位置
    const bottom = relativeTop + elementHeight;

    // 计算视口内允许的最大显示区域
    const availableSpace = viewportHeight - margin;

    // 如果元素底部超出了视口高度
    if (bottom > availableSpace) {
        // 计算新的绝对 top 值，使元素的底部对齐到视口底部，留出 margin 空间
        const newAbsoluteTop = availableSpace - elementHeight;

        // 将新绝对 top 转换为相对于父级的 top 值
        const adjustedTop = newAbsoluteTop - parentTop;

        return {
            top: Math.max(adjustedTop, -parentTop + margin), // 确保 top 不小于 -parentTop
            maxHeight: elementHeight, // 保持元素的原始高度
            needsScrollbar: false, // 元素高度未超出视口，不需要滚动条
        };
    }
    // 如果元素可以完全显示，返回相对父级的原始 top 值
    return {
        top: parentTop ? relativeTop - parentTop : relativeTop, // 保持相对于父级元素的原始偏移
        maxHeight: elementHeight, // 保持原始高度
        needsScrollbar: false, // 高度小于视口，不需要滚动条
    };
}
