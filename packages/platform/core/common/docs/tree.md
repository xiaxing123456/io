# Tree 树形数据处理

> 提供树形数据结构的转换、查找、遍历等操作

## 导入

```typescript
// 命名空间导入
import { treeUtils } from '@dmsplatform/common';

// 直接导入
import {
    treeToList,
    listToTree,
    getAllParentArr,
    findTreeToList,
    addPropertyForTree,
    filterNode,
    scrollToTop,
    FindTreeToListMatchTypeEnum
} from '@dmsplatform/common';
```

## API

### treeToList

将树形结构转换为一维数组。

```typescript
treeToList<T>(tree: T[], childrenKey?: string): T[]
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tree | `T[]` | - | 树形数据 |
| childrenKey | `string` | `'children'` | 子节点的键名 |

**示例：**
```typescript
const tree = [
    { id: 1, name: '节点1', children: [
        { id: 2, name: '节点1-1', children: [] }
    ]}
];

const list = treeToList(tree);
// [{ id: 1, name: '节点1', children: [] }, { id: 2, name: '节点1-1', children: [] }]
```

---

### listToTree

将一维数组转换为树形结构。

```typescript
listToTree(
    list: Record<string, any>[],
    options?: { idKey: string; pIdKey: string; childrenKey: string }
): Record<string, any>[]
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| list | `Record<string, any>[]` | - | 一维数组 |
| options.idKey | `string` | `'id'` | ID 字段名 |
| options.pIdKey | `string` | `'parentId'` | 父 ID 字段名 |
| options.childrenKey | `string` | `'children'` | 子节点字段名 |

**示例：**
```typescript
const list = [
    { id: 1, parentId: null, name: '节点1' },
    { id: 2, parentId: 1, name: '节点1-1' },
    { id: 3, parentId: 1, name: '节点1-2' }
];

const tree = listToTree(list);
// [{ id: 1, parentId: null, name: '节点1', children: [
//     { id: 2, parentId: 1, name: '节点1-1', children: [] },
//     { id: 3, parentId: 1, name: '节点1-2', children: [] }
// ]}]
```

---

### getAllParentArr

查找节点及其所有父节点，返回数组（自身在第一个索引）。

```typescript
getAllParentArr<T>(options: GetAllParentArrOpionts<T>): T[]
```

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| options.list | `T[]` | 树形数据 |
| options.key | `string` | 查找的键名 |
| options.keyValue | `string` | 查找的键值 |
| options.childrenKey | `string` | 子节点键名（默认 `children`） |

**示例：**
```typescript
const tree = [
    { id: '1', name: '根节点', children: [
        { id: '2', name: '子节点', children: [
            { id: '3', name: '孙节点', children: [] }
        ]}
    ]}
];

const parents = getAllParentArr({ list: tree, key: 'id', keyValue: '3' });
// [{ id: '3', ... }, { id: '2', ... }, { id: '1', ... }]
```

---

### findTreeToList

在树形数据中搜索，返回匹配的节点列表。

```typescript
findTreeToList(options: FindTreeToListOptions): Record<string, any>[]
```

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| options.tree | `Record<string, any>[]` | 树形数据 |
| options.findKey | `string` | 搜索的字段名 |
| options.findValue | `any` | 搜索的值 |
| options.childrenKey | `string` | 子节点键名 |
| options.matchType | `FindTreeToListMatchTypeEnum` | 匹配类型 |

**匹配类型枚举：**
```typescript
enum FindTreeToListMatchTypeEnum {
    Equal = 'equal',   // 精确匹配
    Fuzzy = 'fuzzy'    // 模糊匹配（默认）
}
```

**示例：**
```typescript
const results = findTreeToList({
    tree: menuData,
    findKey: 'name',
    findValue: '用户',
    matchType: FindTreeToListMatchTypeEnum.Fuzzy
});
// 返回所有 name 包含 "用户" 的节点
```

---

### addPropertyForTree

为树形数据的所有节点添加属性。

```typescript
addPropertyForTree(options: AddPropertyForTreeOptions): Record<string, any>
```

**示例：**
```typescript
const tree = { id: 1, children: [{ id: 2 }] };

addPropertyForTree({
    treeNode: tree,
    property: { disabled: true },
    childrenKey: 'children',
    isCopy: true  // 是否返回副本
});
```

---

### filterNode

树节点过滤函数，用于 el-tree 等组件的 filter-node-method。

```typescript
filterNode(value: string, data: Record<string, any>, node: Record<string, any>): boolean
```

**示例：**
```typescript
<el-tree
    :filter-node-method="filterNode"
    ...
/>
```

---

### scrollToTop

通用滚动到顶部方法，支持多种元素类型。

```typescript
scrollToTop(targetRef: HTMLElement | Ref<HTMLElement> | ComponentInstance): void
```

**示例：**
```typescript
// DOM 元素
scrollToTop(document.querySelector('.container'));

// Vue ref
const containerRef = ref<HTMLElement>();
scrollToTop(containerRef);

// 组件实例
scrollToTop(treeRef.value);
```
