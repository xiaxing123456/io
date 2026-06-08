import { format, MathType } from 'mathjs';
// import { isFinite } from 'lodash';

const isFinite = (val: number | string) => {
    return Number.isFinite(Number(val));
};

/**
 *	按照精确度格式化数字(主要用于小数解决双精度问题)
 * @param val 需要格式化的值
 * @param precision 最大精确度
 * @returns
 */
export const numberFormatForDouble = (val: MathType, precision = 14): number => {
    return +format(val, { precision });
};

/**
 * 判断是不是有限数字
 * @param val 值
 * @returns
 */
export const isFiniteNumber = (val: number | string) => {
    return isFinite(Number(val));
};
