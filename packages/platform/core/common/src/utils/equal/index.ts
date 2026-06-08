import { isEqual } from 'lodash-es';
import { getTrimData } from '../array';
import type { TrimOtions } from '../array/array.types';

/**
 * 对比根据 TrimOtions 删除key匹配后的数组对象
 * @param val1 数组对象
 * @param val2 数组对象
 * @param trimOtions key匹配对象配置项 match: 正则匹配; equal: 字符串相等匹配 or 字符串数组匹配多个
 * @returns
 */
export const isEqualTrim = <T extends Record<string, any>>(
    val1: T[],
    val2: T[],
    trimOptions: TrimOtions
) => {
    return isEqual(getTrimData(val1, trimOptions), getTrimData(val2, trimOptions));
};

export { isEqual };
