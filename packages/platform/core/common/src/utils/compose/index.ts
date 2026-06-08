import type { argsFn } from './index.types';

/**
 * 包装函数（函数组合）
 */
export const compose: argsFn = (...fns) => {
    const len = fns.length;
    if (!len) throw new Error('There must be at least one function...');

    if (len === 1) return fns[0];

    return fns.reduce(
        (a: argsFn, b: argsFn) =>
            (...arg: any[]) =>
                a(b(...arg))
    );
};

export type { argsFn };
