# PltMenu 使用文档

本文档对应当前组件实现：[plt-menu.tsx](./plt-menu.tsx) 和核心逻辑：[use-tree/index.ts](./src/composables/use-tree/index.ts)。

## 1. 组件定位

PltMenu 是一个基于 `PltVirtuallyList` 的虚拟树形菜单组件，适合左侧导航、应用菜单等层级数据场景。

当前实现支持：

- 树形数据扁平化渲染；
- 虚拟滚动，减少大量菜单节点带来的 DOM 压力；
- 节点展开 / 收起；
- 当前节点高亮；
- 折叠模式下的级联浮层菜单；
- 关键字过滤；
- 关键字高亮；
- vue-router 路由跳转；
- 通过组件实例方法控制展开、选中、滚动。

> 当前已取消“快捷应用 / 快捷入口设置”逻辑：组件不再显示添加 / 移除快捷应用图标，也不再抛出 `addApplication` 事件。

## 2. 文件结构

```text
plt-menu/
├── README.md
├── plt-menu.tsx
└── src/
    ├── components/
    │   ├── cascader-menu.tsx
    │   └── virtually-menu-node.tsx
    ├── composables/
    │   ├── use-filter/
    │   │   └── index.ts
    │   ├── use-text-width/
    │   │   └── index.ts
    │   └── use-tree/
    │       └── index.ts
    ├── type/
    │   └── index.ts
    └── util/
        └── index.ts
```

| 文件 | 说明 |
| --- | --- |
| [plt-menu.tsx](./plt-menu.tsx) | 组件入口，负责主菜单渲染、插槽转发、折叠浮层挂载。 |
| [cascader-menu.tsx](./src/components/cascader-menu.tsx) | 折叠模式下的级联子菜单。 |
| [virtually-menu-node.tsx](./src/components/virtually-menu-node.tsx) | 单个菜单节点渲染。 |
| [use-tree/index.ts](./src/composables/use-tree/index.ts) | 树数据处理、展开收起、选中、路由、滚动、过滤等核心逻辑。 |
| [use-filter/index.ts](./src/composables/use-filter/index.ts) | 关键字过滤逻辑。 |
| [use-text-width/index.ts](./src/composables/use-text-width/index.ts) | 折叠菜单中用于计算菜单文本宽度。 |
| [type/index.ts](./src/type/index.ts) | 树节点、菜单数据、字段配置类型。 |
| [util/index.ts](./src/util/index.ts) | 浮层菜单位置计算。 |

## 3. 注册与引入

组件已在 [components/index.ts](../index.ts) 中导出，并通过 `platformUIComponents` 统一注册。

在已接入 `@io-platform/core-ui` 的业务应用中，可以直接使用：

```vue
<template>
  <plt-menu :data="menus" />
</template>
```

如需局部引入：

```ts
import { pltMenu } from '@io-platform/core-ui/components';
```

## 4. 基础用法

### 4.1 基础菜单

默认字段为：

- 子节点：`children`
- 文案：`label`
- 唯一值：`value`

```vue
<template>
  <div class="menu-demo">
    <plt-menu
      :data="menus"
      :min-size="42"
      default-active="/system/user"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script lang="ts" setup>
const menus = [
  {
    value: 'home',
    label: '首页',
    path: '/home',
  },
  {
    value: 'system',
    label: '系统管理',
    children: [
      {
        value: 'system-user',
        label: '用户管理',
        path: '/system/user',
      },
      {
        value: 'system-role',
        label: '角色管理',
        path: '/system/role',
      },
    ],
  },
];

const handleNodeClick = (data: any, node: any, event: MouseEvent) => {
  console.log('点击菜单：', data, node, event);
};
</script>

<style lang="scss" scoped>
.menu-demo {
  height: 100%;
}

:deep(.plt-virtually-list__client) {
  height: 100%;
  overflow-y: auto;
}
</style>
```

> PltMenu 内部使用 `PltVirtuallyList`，因此滚动容器仍然需要明确高度和 `overflow-y: auto`。

### 4.2 自定义字段名

如果后端数据使用 `id`、`name`、`items` 等字段，可以通过 `fieldNames` 映射：

```vue
<template>
  <plt-menu
    :data="menus"
    :field-names="{
      value: 'id',
      label: 'name',
      children: 'items',
    }"
  />
</template>

<script lang="ts" setup>
const menus = [
  {
    id: 1,
    name: '工作台',
    path: '/dashboard',
  },
  {
    id: 2,
    name: '平台管理',
    items: [
      {
        id: 21,
        name: '应用管理',
        path: '/platform/app',
      },
    ],
  },
];
</script>
```

### 4.3 路由模式

开启 `router` 后，点击带 `path` 的节点会执行 `router.push(node.path)`。

```vue
<template>
  <plt-menu
    :data="menus"
    router
    :default-active="$route.fullPath"
    @current-change="handleCurrentChange"
  />
</template>
```

说明：

- 有 `path` 的节点点击后会跳转路由；
- 开启 `router` 时，没有 `path` 的节点不会被选中；
- `defaultActive` 会按节点 `path` 进行匹配；
- 匹配 URL 查询参数时，当前实现会忽略 `customParameters`、`noticeId` 两个参数。

### 4.4 默认展开

```vue
<template>
  <plt-menu
    :data="menus"
    :default-expanded-keys="['/system/user']"
    default-active="/system/user"
  />
</template>
```

当前实现会把 `defaultExpandedKeys` 中的值作为路径进行匹配，再转换为节点 key，并展开对应节点的父级链路。

如果需要直接通过节点 key 控制展开，可以使用组件实例方法 `setExpandedKeys()`。

### 4.5 关键字过滤

```vue
<template>
  <div class="menu-demo">
    <input v-model="keyword" placeholder="搜索菜单" @input="handleSearch" />

    <plt-menu
      ref="menuRef"
      :data="menus"
      :keyword="keyword"
      :filter-method="filterMenu"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const keyword = ref('');
const menuRef = ref<any>();

const filterMenu = (query: string, rawNode: any) => {
  return rawNode.label?.includes(query);
};

const handleSearch = () => {
  menuRef.value?.filter(keyword.value);
};
</script>
```

过滤逻辑说明：

- `filterMethod(query, nodeData)` 返回 `true` 表示节点匹配；
- 匹配节点的祖先节点会自动展开；
- 不匹配的叶子节点会被隐藏；
- 如果某个非叶子节点所有子节点都被隐藏，会隐藏展开图标；
- `keyword` 会传给菜单节点，用于内容插槽中的高亮处理。

### 4.6 折叠模式

设置 `collapse` 后，主菜单进入折叠模式；鼠标移入节点时，如果节点有子级，会通过 `Teleport` 把级联菜单挂到 `body`。

```vue
<template>
  <plt-menu
    :data="menus"
    collapse
    default-active="/system/user"
  />
</template>
```

折叠菜单会使用 CSS 变量 `--plt-menu-row-height` 计算行高，默认兜底值为 `42`。

```scss
:root {
  --plt-menu-row-height: 42px;
}
```

## 5. Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `Record<string, any>[]` | `[]` | 菜单原始数据。 |
| `fieldNames` | `{ children?: string; label?: string; value?: string }` | `{ children: 'children', label: 'label', value: 'value' }` | 原始数据字段映射。 |
| `defaultExpandedKeys` | `(string \| number)[]` | `[]` | 默认展开项。当前实现按节点 `path` 匹配并转换为 key。 |
| `indent` | `number` | `16` | 层级缩进，单位 px。 |
| `minSize` | `number` | `10` | 虚拟列表项最小 / 预估高度。建议与菜单行高一致。 |
| `expandOnClickNode` | `boolean` | `true` | 点击节点时是否展开 / 收起节点。 |
| `filterMethod` | `(query: string, node: Record<string, any>) => boolean` | - | 节点过滤函数。 |
| `collapse` | `boolean` | `false` | 是否开启折叠菜单模式。 |
| `defaultActive` | `string` | `''` | 默认激活路径。当前实现按节点 `path` 匹配。 |
| `router` | `boolean` | `false` | 是否启用 vue-router 跳转。 |
| `keyword` | `string` | `''` | 搜索关键字，用于过滤和内容高亮。 |

## 6. 数据结构

### 6.1 原始数据

默认原始数据字段如下：

```ts
interface MenuData {
  value: string | number;
  label: string;
  path?: string;
  children?: MenuData[];
  [key: string]: any;
}
```

如果字段名不同，请使用 `fieldNames` 做映射。

### 6.2 内部节点 ITreeNode

组件会把原始数据转换成内部节点结构：

```ts
interface ITreeNode<T = Record<string, any>> {
  key: string | number;
  level: number;
  parent?: ITreeNode;
  children?: ITreeNode[];
  data: T;
  label: string;
  isLeaf?: boolean;
  path?: string;
  width?: number;
  fullPath?: string;
  rootId?: string | number;
  id?: number;
  parseUrlObj?: Record<string, string>;
}
```

事件和实例方法中的 `node` 都是 `ITreeNode`。

## 7. Events

| 事件名 | 参数 | 触发时机 |
| --- | --- | --- |
| `node-click` | `(data, node, event)` | 点击可选中菜单节点时。 |
| `node-expand` | `(data, node)` | 节点展开时。 |
| `node-collapse` | `(data, node)` | 节点收起时。 |
| `current-change` | `(data, node)` | 当前选中节点变化时。 |
| `scroll` | `(event)` | 虚拟列表滚动时。 |

已移除事件：

| 事件名 | 说明 |
| --- | --- |
| `addApplication` | 快捷应用设置相关事件已取消。 |

## 8. Slots

### 8.1 icon

用于自定义节点图标。

```vue
<template #icon="{ node }">
  <span :class="node.isLeaf ? 'icon-file' : 'icon-folder'" />
</template>
```

### 8.2 content

用于自定义节点内容。组件会把 `node` 作为插槽参数传入。

```vue
<template #content="{ node }">
  <span class="menu-text">{{ node.label }}</span>
</template>
```

如果需要配合 `keyword` 高亮，建议内容中保留可被 helper 查找的 `menu-text` class。

### 8.3 empty

透传给内部 `PltVirtuallyList` 的空状态插槽。

```vue
<template #empty>
  <div class="menu-empty">暂无菜单</div>
</template>
```

## 9. 组件实例方法

可以通过 `ref` 调用组件实例方法：

```vue
<template>
  <plt-menu ref="menuRef" :data="menus" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const menuRef = ref<any>();

const selectUserMenu = () => {
  menuRef.value?.setCurrentKey('system-user');
};

const expandAll = () => {
  menuRef.value?.expandAllNodes();
};
</script>
```

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| `filter(query)` | `query: string` | 根据 `filterMethod` 过滤节点，并展开匹配节点父级。 |
| `setTreeData(data)` | `data: TreeData` | 重建内部树结构。 |
| `setCurrentKey(key)` | `key: string \| number` | 设置当前选中节点。非折叠模式下会展开目标节点父级，折叠模式下会滚动到根节点。 |
| `getCurrentKey()` | - | 获取当前选中 key。 |
| `getCurrentNode(dataOrKey)` | `TreeKey \| TreeNodeData` | 根据 key 或原始数据获取内部节点。 |
| `getNodeByKey(key)` | `TreeKey` | 根据 key 获取内部节点。 |
| `setExpandedKeys(keys)` | `TreeKey[]` | 设置展开节点，自动展开每个节点的父级。 |
| `expandNode(node)` | `ITreeNode` | 展开指定节点。 |
| `collapseNode(node)` | `ITreeNode` | 收起指定节点。 |
| `expandNodeByKey(key)` | `TreeKey` | 根据 key 展开指定节点及其父级。 |
| `collapseNodeByKey(key)` | `TreeKey` | 根据 key 收起指定节点。 |
| `expandAllNodes()` | - | 展开所有拥有子节点的节点。 |
| `collapseAllNods()` | - | 收起所有节点。注意当前方法名为 `collapseAllNods`。 |
| `scrollToTarget(key, isTop?)` | `TreeKey, boolean` | 滚动到指定节点，`isTop` 为 `true` 时滚动到顶部位置，否则滚动到可视区域内。 |
| `scrollToTop()` | - | 滚动到顶部。 |
| `scrollToBottom()` | - | 滚动到底部。 |

## 10. 样式要求

PltMenu 当前主要输出 class，不在组件目录内内置完整样式。业务侧需要提供菜单容器、节点、选中态、折叠浮层等样式。

最小样式示例：

```scss
:root {
  --plt-menu-row-height: 42px;
}

.plt-menu {
  height: 100%;
}

.plt-menu :deep(.plt-virtually-list__client) {
  height: 100%;
  overflow-y: auto;
}

.virtually-menu-item,
.cascader-item {
  height: var(--plt-menu-row-height);
  line-height: var(--plt-menu-row-height);
  cursor: pointer;
}

.virtually-tree-item-container,
.cascader-item {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  white-space: nowrap;
}

.virtually-tree-item-container--current,
.virtually-tree-collapse-item-container--current {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.collapse-animation,
.submenu {
  position: absolute;
  z-index: 2000;
  background: #fff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
  overflow: hidden;
}
```

## 11. 关键实现机制

### 11.1 树结构转换

`useTree` 会把原始 `data` 转为内部树结构，并生成：

- `treeNodesMap`：key 到节点的映射；
- `treeNodes`：根节点列表；
- `levelNodesMap`：按层级分组的节点；
- `fullPath`：由父级 label 拼出的完整文本路径；
- `parseUrlObj`：由节点 `path` 解析出的 URL 和查询参数对象。

### 11.2 扁平化渲染

组件根据 `expandedKeysSet` 把树转为 `flattenList`，再交给 `PltVirtuallyList` 渲染。

### 11.3 路径重新匹配

当菜单数据刷新导致 key 变化时，组件会尝试用当前路由路径重新匹配节点，避免高亮丢失。

### 11.4 折叠浮层

折叠模式下，鼠标移入主菜单节点时：

1. 读取当前节点 DOM 的位置；
2. 把子级数据交给 `CascaderMenu`；
3. 通过 `Teleport` 把浮层渲染到 `body`；
4. 根据视口高度修正浮层位置。

## 12. 当前不再支持的能力

已取消快捷应用设置相关能力，包括：

- 不再读取 `navigationType=PERSON` 来决定是否显示快捷入口；
- 不再显示 `icon-plt-tianjia` / `icon-plt-yitianjia`；
- 不再依赖 `userHomepage.setShortcutAppTooptip` / `userHomepage.removeShortcutAppTooptip` 文案；
- 不再抛出 `addApplication` 事件；
- `ITreeNode` 不再声明 `isShortCut`、`nodeType` 字段。

这样可以让 `PltMenu` 保持为纯菜单组件，不绑定具体业务的“快捷应用”能力。
