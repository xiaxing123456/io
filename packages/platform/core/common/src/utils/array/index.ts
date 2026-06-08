import { cloneDeep, pickBy } from 'lodash-es';
import type { TrimOtions } from './array.types';

/**
 * 获取删除key匹配后的数组对象(暂不支持树型数据)
 * @param data 数组对象
 * @param trimOtions key匹配对象配置项 match: 正则匹配; equal: 字符串相等匹配 or 字符串数组匹配多个
 * @returns
 */
export const getTrimData = <T extends Record<string, any>>(
    data: T[],
    trimOtions: TrimOtions
): T[] => {
    const cloneData = cloneDeep(data);

    if (!Array.isArray(data) || !data.length) return data;

    const result: T[] = [];

    const cloneCustomizer = (val: any, key: string) => {
        if (trimOtions?.match?.test(key)) return false;

        // handle equal key
        if (typeof trimOtions.equal === 'string') {
            if (trimOtions.equal === key) {
                return false;
            }
        } else if (Array.isArray(trimOtions.equal)) {
            if (trimOtions.equal.includes(key)) return false;
        }

        return true;
    };

    cloneData.forEach(item => {
        const pickData = pickBy(item, cloneCustomizer) as T;
        result.push(pickData);
    });

    return result;
};

/**
 * 根据已有数据选项的索引获取排序后的值对象
 * @param val 排序前的数值对象
 * @param options 数值选项
 * @param config 配置项 valKey: 数值对应的key; sortBy: asc升序, desc降序 (根据数据选项的索引)
 * @returns
 */
export const getSortValForOptionIndex = <T>(
    val: T[],
    options: any[],
    config?: {
        valKey?: string | number;
        sortBy?: 'asc' | 'desc';
    }
) => {
    const valKey = config?.valKey || 'value';
    const sortBy = config?.sortBy || 'asc';

    const select: Array<Record<string, any>> = [];

    options.forEach((item, index) => {
        if (val.includes(item[valKey])) {
            select.push({
                ...item,
                index,
            });
        }
    });

    const sortFn = (a: any, b: any) => {
        if (sortBy === 'asc') {
            return a.index - b.index;
        }

        return b.index - a.index;
    };

    return (select.sort(sortFn).map(item => item[valKey]) as T[]) || [];
};

/**
 * 根据配置数组和表单数据计算逻辑表达式的结果
 * @param {Object} formData - 包含表单数据的对象，键值对形式存储各个字段的值
 * @param {Array} configArray - 配置数组，每个元素是一个对象，包含逻辑判断所需的信息
 * @returns {boolean|null} - 返回逻辑表达式的计算结果，如果配置数组为空/不存在则返回 false，不禁用
 */
export const evaluateLogic = <T extends Record<string, any>>(
    formData: T,
    configArray: Array<Record<string, any>> | boolean
) => {
    if (typeof configArray === 'boolean') return configArray;
    // 检查配置数组是否为空，如果为空则直接返回 false
    if (!configArray?.length) {
        return false;
    }

    // 获取配置数组中的第一个条件对象
    const firstCondition = configArray[0];

    // 根据第一个条件对象中的 equal 字段，判断是进行相等比较还是不等比较
    const result = firstCondition.equal
        ? formData[firstCondition.key] === firstCondition.value
        : formData[firstCondition.key] !== firstCondition.value;

    // 从第二个元素开始遍历配置数组，使用 reduce 方法进行逻辑运算
    const cloneConfigArray = cloneDeep(configArray);
    const calcResult = cloneConfigArray.slice(1).reduce((acc, current) => {
        // 计算当前条件的结果
        const currentResult = current.equal
            ? formData[current.key] === current.value
            : formData[current.key] !== current.value;
        // 根据当前条件对象中的 relation 字段进行逻辑运算
        if (current.relation === 'and') {
            return acc && currentResult;
        }
        if (current.relation === 'or') {
            return acc || currentResult;
        }
        return acc;
    }, result);

    return calcResult;
};

export type { TrimOtions };
