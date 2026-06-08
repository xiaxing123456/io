enum MoveTypeEnum {
    UP = 'up',
    DOWN = 'down',
}

interface RowMoveOptions<T = Record<string, any>> {
    row: T;
    data: T[];
    type: 'up' | 'down';
    rowPropKey: string;
    source?: string;
}

/**
 * 根据提供的选项将数据数组中的一行上移或下移
 *
 * @param {RowMoveOptions} options - 移动行选项
 * @param {T[]} options.data - 行数据
 * @param {T} options.row - 要移动的行对象
 * @param {MoveTypeEnum} options.type - 移动操作的类型（上移或下移）
 * @param {string} options.rowPropKey - 用于标识行的属性键
 * @param {string} [options.source] - 可选的属性键，用于标识行
 */
export const objRowMove = <T = Record<string, any>>({
    data,
    row,
    type,
    rowPropKey,
    source,
}: RowMoveOptions<T>) => {
    if (!row) {
        return;
    }
    let index;
    // 如果提供了行属性键，则使用主键和属性键查找行的��引
    if (source) {
        index = data.findIndex(
            (e: any) =>
                e[rowPropKey] === (row as any)[rowPropKey] && e[source] === (row as any)[source]
        );
    } else {
        // 否则只使用主键查找行的索引
        index = data.findIndex((e: any) => e[rowPropKey] === (row as any)[rowPropKey]);
    }

    // 如果找不到行的索引，则抛出错误
    if (index === -1) {
        throw new Error('Not found index for data');
    }

    // 如果是上移操作
    if (type === MoveTypeEnum.UP) {
        // 如果已经是第一行了，则不做任何操作
        if (!index) {
            return;
        }
        // 在目标位置插入行，并从原位置删除行
        data.splice(index - 1, 0, row);
        data.splice(index + 1, 1);
    }
    // 如果是下移操作
    if (type === MoveTypeEnum.DOWN) {
        // 如果已经是最后一行了，则不做任何操作
        if (index + 1 === data.length) {
            return;
        }
        // 在目标位置插入行，并从原位置删除行
        data.splice(index + 2, 0, row);
        data.splice(index, 1);
    }
};

export { MoveTypeEnum };
export type { RowMoveOptions };
