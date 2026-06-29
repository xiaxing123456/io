import { cloneDeep } from 'lodash-es';

/**
 * 树型结构转一维数组
 * @param tree 源数据
 * @param childrenKey 子节点的key
 * @param option.isCopy 是否启用复制 default: true
 * @returns
 */
export const treeToList = <T = Record<string, any>>(tree: T[], childrenKey = 'children') => {
    let queen: T[] = cloneDeep(tree);
    const result: T[] = [];
    while (queen.length) {
        const item = queen.shift() as Record<string, any> | undefined;
        if (item?.[childrenKey]?.length) {
            queen = [...queen, ...item[childrenKey]];
            item[childrenKey] = [];
        }
        result.push(item as T);
    }
    return result;
};

export interface GetAllParentArrOpionts<T = Record<string, any>> {
    list: T[];
    key: string;
    keyValue: string;
    childrenKey?: string;
}

/**
 * 查找自身及父级节点，自身节点在第一个索引
 * @param param0 list: 源数据（数组对象树型结构）
 * @param param1 key: 需要查找的对象key
 * @param param2 keyValue : 需要查找的对象key值
 * @param param3 childrenKey : 子节点的key; 默认值: children
 * @returns
 */
export const getAllParentArr = <T = Record<string, any>>({
    list,
    key,
    keyValue,
    childrenKey,
}: GetAllParentArrOpionts<T>): T[] => {
    if (!list?.length) return [];

    const $_childrenKey = childrenKey || 'children';

    for (let index = 0; index < list.length; index++) {
        const item = list[index] as Record<string, any>;
        if (item[key] === keyValue) {
            // 查询到返回该数组对象
            return [item] as T[];
        }

        if (item?.[$_childrenKey]?.length) {
            const node: T[] = getAllParentArr({
                list: item[$_childrenKey],
                key,
                keyValue,
                childrenKey: $_childrenKey,
            });

            if (node?.length) {
                // 查询到把父节点连起来
                return node.concat(item as T);
            }
        }
    }
    return [];
};

export enum FindTreeToListMatchTypeEnum {
    Equal = 'equal',
    Fuzzy = 'fuzzy',
}

/**
 * @param tree - 树形数据
 * @param childrenKey - 字节点的 key
 * @param findKey - 需要查找的 key
 * @param findValue - 需要查找的 keyValue
 * @param matchType - 枚举 FindTreeToListMatchTypeEnum: Equal (等于)、Fuzzy (模糊匹配)
 */
interface FindTreeToListOptions {
    tree: Record<string, any>[];
    childrenKey?: string;
    findKey: string;
    findValue: any;
    matchType?: FindTreeToListMatchTypeEnum;
}

/**
 * 查找树形数据, 并返回 array list
 * @param tree - 树形数据
 * @param childrenKey - 字节点的 key
 * @param findKey - 需要查找的 key
 * @param findValue - 需要查找的 keyValue
 * @param matchType - 枚举 FindTreeToListMatchTypeEnum: Equal (等于)、Fuzzy (模糊匹配)
 * @returns
 */
export const findTreeToList = ({
    tree,
    childrenKey,
    findKey,
    findValue,
    matchType,
}: FindTreeToListOptions) => {
    const list = treeToList(tree, childrenKey);

    return list?.filter(item => {
        // 精确查找 precise search
        if (matchType === FindTreeToListMatchTypeEnum.Equal) {
            return item[findKey] === findValue;
        }

        // 模糊查找 fuzzy search
        if (!matchType || matchType === FindTreeToListMatchTypeEnum.Fuzzy) {
            return item[findKey]?.includes(findValue);
        }

        return false;
    });
};

/** 为树形数据新增key value (原 keyValue会被替换) begin */
interface AddPropertyForTreeOptions {
    treeNode: Record<string, any>;
    property: Record<string, any>;
    childrenKey?: string;
    isCopy?: boolean;
}

interface UpdateTreeNodeForTreeOptions<
    T extends Record<string, any> = Record<string, any>,
    TreeNode extends T[] = T[],
> {
    treeNode: TreeNode;
    updateNode: (node: T) => T;
    childrenKey?: string;
    isCopy?: boolean;
}

/**
 * 为树形数据新增key value (原 keyValue会被替换, 该方法会更改源数据，不需要更改请copy后再使用此方法或者使用isCopy)
 * @param treeNode - 树节点
 * @param property - 需要新增/替换的key value
 * @param childrenKey - 子节点key
 * @returns
 */
export const addPropertyForTree = ({
    treeNode,
    property,
    childrenKey,
    isCopy,
}: AddPropertyForTreeOptions) => {
    if (!treeNode) return treeNode;

    const stack = isCopy ? cloneDeep([treeNode]) : [treeNode];
    const $_childrenKey = childrenKey || 'children';

    while (stack?.length) {
        const currentNode = stack.pop() || ({} as Record<string, any>);
        const currentNodeChildren = currentNode?.[$_childrenKey] as
            | Record<string, any>[]
            | undefined;

        if (currentNodeChildren?.length) {
            currentNodeChildren.forEach(child => {
                Object.assign(child, property);
            });
        }
    }

    return treeNode;
};

/**
 * 更新树形数据节点 (该方法会更改源数据，不需要更改请copy后再使用此方法或者使用isCopy)
 * @param treeNode - 树节点
 * @param updateNode - 节点更新方法，入参是节点信息，出参是更新后的节点信息
 * @param childrenKey - 子节点key
 * @returns
 */
export const updateTreeNodeForTree = <
    T extends Record<string, any> = Record<string, any>,
    TreeNode extends T[] = T[],
>({
    treeNode,
    updateNode,
    childrenKey,
    isCopy,
}: UpdateTreeNodeForTreeOptions<T, TreeNode>): TreeNode => {
    if (!treeNode) return treeNode;

    const result = isCopy ? cloneDeep(treeNode) : treeNode;
    const stack = Array.isArray(result) ? [...result] : [result];
    const $_childrenKey = childrenKey || 'children';

    while (stack?.length) {
        const currentNode = stack.pop() || ({} as T);
        const currentNodeChildren = currentNode?.[$_childrenKey] as T[] | undefined;
        const updatedNode = updateNode(currentNode);

        Object.assign(currentNode, updatedNode);

        if (currentNodeChildren?.length) {
            stack.push(...currentNodeChildren);
        }
    }

    return result;
};

/**
 * 一维对象数组转成结树形结构
 * @param list 一维对象数组
 * @param options.idKey 数据的唯一id - defualt id
 * @param options.pIdKey 数据的parendId - default parentId
 * @param options.childrenKey 子节点容器的key - default children
 * @returns
 */
export const listToTree = (
    list: Record<string, any>[],
    {
        idKey,
        pIdKey,
        childrenKey,
    }: {
        idKey: string;
        pIdKey: string;
        childrenKey: string;
    } = {
        idKey: 'id',
        pIdKey: 'parentId',
        childrenKey: 'children',
    }
) => {
    const [map, treeData]: [Record<string, any>, Record<string, any>[]] = [{}, []];

    // 数组转成 map ( id: value ) 形式
    for (let index = 0; index < list.length; index++) {
        map[list[index][idKey]] = index;
        list[index][childrenKey] = [];
    }

    for (let index = 0; index < list.length; index++) {
        const node = list[index];
        if (node[pIdKey] && list[map[node[pIdKey]]]) {
            list[map[node[pIdKey]]][childrenKey].push(node);
        } else {
            treeData.push(node);
        }
    }

    return treeData;
};

/** 树节点过滤
 * @description 搜索结果为父节点时，子节点也自动展开显示
 * @param value 搜索关键字
 * @param data 树节点数据
 * @param node 当前节点
 * @returns 返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏
 */
export const filterNode = (value: string, data: Record<string, any>, node: Record<string, any>) => {
    let parentNode = node.parent; // 父级node
    let labels = [node.label]; // 当前node的名字
    let level = 1; // 层级
    while (level < node.level) {
        labels = [...labels, parentNode.label]; // 当前node名字，父级node的名字
        parentNode = parentNode.parent;
        level++;
    }
    return labels.some(d => d.toUpperCase().indexOf(value.toUpperCase()) !== -1);
};

/**
 * 通用滚动到顶部方法
 * @param targetRef - 可能是 HTMLElement、Vue 组件实例、或 DOMRef
 */
export const scrollToTop = (targetRef: any) => {
    if (!targetRef) return;

    let el: HTMLElement | null = null;

    // 1. 判断是否直接是 DOM（原生元素）
    if (targetRef instanceof HTMLElement) {
        el = targetRef;
    }

    // 2. 判断是否是 ref.value 是 DOM
    else if (targetRef.value instanceof HTMLElement) {
        el = targetRef.value;
    }

    // 3. 若是组件实例，尝试获取其根 DOM
    else if (targetRef.value?.$el instanceof HTMLElement) {
        el = targetRef.value.$el;
    }

    // 4. 若组件内部暴露了某个 DOM ref（如 expose）
    else if (targetRef.$el instanceof HTMLElement) {
        el = targetRef.$el;
    }

    if (!el) {
        console.warn('scrollToTop: 未找到可滚动的 DOM 元素', targetRef);
        return;
    }

    // 执行滚动
    el.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};
