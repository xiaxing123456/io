/**
 * 小驼峰转下划线
 * @param str
 * @description 将字符串中的大写字母转换为小写，并在前面添加下划线。
 * 例如：`myVariableName` 转换为 `my_variable_name`
 * @returns
 */
export const camelToSnake = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

/**
 * 下划线转小驼峰
 * @param str
 * @description 将字符串中的下划线和小写字母转换为小驼峰格式。
 * 例如：`my_variable_name` 转换为 `myVariableName`
 * @returns
 */
export const snakeToCamel = (str: string) =>
    str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

/**
 * 递归转换单个节点的键
 * @param obj
 * @param keyConverter
 * @returns
 */
const convertObjectKeysDeep = (
    obj: Record<string, any>,
    keyConverter: (key: string) => string
): Record<string, any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        const newKey = keyConverter(key);
        if (Array.isArray(value)) {
            acc[newKey] = value.map(v =>
                typeof v === 'object' && v !== null ? convertObjectKeysDeep(v, keyConverter) : v
            );
        } else if (typeof value === 'object' && value !== null) {
            acc[newKey] = convertObjectKeysDeep(value, keyConverter);
        } else {
            acc[newKey] = value;
        }
        return acc;
    }, {} as Record<string, any>);
};

/**
 * 转换树形数组（外层 map 包一层）
 * @param treeData
 * @param keyConverter
 * @returns
 */
export const convertTreeDataKeys = (
    treeData: Record<string, any>[],
    keyConverter: (key: string) => string
): Record<string, any>[] => {
    return treeData.map(node => convertObjectKeysDeep(node, keyConverter));
};
