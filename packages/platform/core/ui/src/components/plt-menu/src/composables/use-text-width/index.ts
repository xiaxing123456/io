import type { ITreeNode } from '../../../../../types/plt-menu/plt-menu';

// 使用单例模式的测量 span，避免重复创建 DOM 元素
let globalMeasureSpan: HTMLSpanElement | null = null;

// 文本宽度缓存，避免重复测量相同文本
const textWidthCache = new Map<string, number>();

// 提取样式属性键名
const FONT_STYLE_KEYS = [
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'wordSpacing',
  'textTransform',
] as const;

/**
 * 获取或创建全局测量用的 span 元素
 */
const getGlobalMeasureSpan = (): HTMLSpanElement => {
  if (!globalMeasureSpan || !globalMeasureSpan.isConnected) {
    globalMeasureSpan = document.createElement('span');
    globalMeasureSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            pointer-events: none;
            top: -9999px;
            left: -9999px;
        `;
    document.body.appendChild(globalMeasureSpan);
  }
  return globalMeasureSpan;
};

/**
 * 生成样式缓存键
 */
const generateStyleKey = (style: CSSStyleDeclaration): string =>
  FONT_STYLE_KEYS.map(key => style[key]).join('|');

/**
 * 用于获取最大文本宽度的 Hook
 * @param targetElement - 用于参考的目标元素
 * @returns 返回计算文本宽度的方法
 */
export const useTextWidth = (targetElement: HTMLElement | null) => {
  const style = getComputedStyle(targetElement || document.body);
  const styleKey = generateStyleKey(style);

  // 初始化时一次性设置样式，而非每次测量都设置
  const span = getGlobalMeasureSpan();
  FONT_STYLE_KEYS.forEach(key => {
    span.style[key] = style[key];
  });

  /**
   * 计算文本宽度
   * 使用 DOM 测量代替 Canvas measureText，修复 Firefox 下 14px 字体计算不准确的问题
   * @param text - 要测量的文本
   * @returns 文本的宽度
   */
  const calculateTextWidth = (text: string): number => {
    const cacheKey = `${styleKey}:${text}`;

    // 命中缓存直接返回
    if (textWidthCache.has(cacheKey)) {
      return textWidthCache.get(cacheKey) as number;
    }

    span.textContent = text;
    const { width } = span.getBoundingClientRect();

    // 缓存测量结果，限制缓存大小防止内存泄漏
    if (textWidthCache.size > 1000) {
      const firstKey = textWidthCache.keys().next().value;
      if (firstKey) textWidthCache.delete(firstKey);
    }
    textWidthCache.set(cacheKey, width);

    return width;
  };

  /**
   * 计算并返回最大文本宽度
   * @param items - 要计算宽度的文本数组
   * @returns 最大文本的宽度
   */
  const getMaxTextWidth = (items: ITreeNode[]): number => {
    if (!items?.length) return 0;
    return Math.max(...items.map(item => calculateTextWidth(item.label)));
  };

  return {
    getMaxTextWidth,
    calculateTextWidth,
  };
};
