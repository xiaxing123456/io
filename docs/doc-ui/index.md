# @io-platform/core-ui 组件文档

`@io-platform/core-ui` 是平台通用 UI 组件包，当前已有组件包括：`PltIcon`、`PltLoading`、`pltMenu`、`PltObserverItem`、`pltTree`、`PltVirtuallyList`。

本文按每个组件说明：**组件用途**、**使用方法**、**常用按钮/交互示例**、**使用效果**。

## 快速接入

### 安装依赖

在 monorepo 内已通过 workspace 依赖接入：

```json
{
  "dependencies": {
    "@io-platform/core-ui": "workspace:*"
  }
}
```

### 引入样式

业务应用需要显式引入组件样式：

```ts
import '@io-platform/core-ui/style.css';
```

### 全局注册组件

```ts
import type { App } from 'vue';
import { platformUIComponents } from '@io-platform/core-ui';
import '@io-platform/core-ui/style.css';

export const setupCoreUI = (app: App) => {
  platformUIComponents.forEach(component => {
    app.component(component.name || component?.customOptions?.name, component);
  });
};
```

### 局部引入组件

```ts
import {
  PltIcon,
  PltVirtuallyList,
  pltMenu,
  pltTree,
  PltObserverItem,
} from '@io-platform/core-ui/components';
import { PltLoading } from '@io-platform/core-ui/components/plt-loading';
```

## 组件总览

| 组件 | 定位 | 常见使用场景 |
| --- | --- | --- |
| `PltIcon` | 图标兼容组件 | Element Plus 图标、iconfont、内联 SVG 统一渲染 |
| `PltLoading` | Loading 插件/服务 | 请求 loading、局部遮罩、全屏遮罩 |
| `pltMenu` | 虚拟树形菜单 | 后台左侧导航、多级应用菜单、折叠菜单 |
| `PltObserverItem` | 尺寸观测包装项 | 虚拟列表内部元素尺寸监听，也可作为 ResizeObserver 包装器 |
| `pltTree` | 基于 `vxe-grid` 的树组件 | 树表格、勾选、搜索、拖拽排序 |
| `PltVirtuallyList` | 虚拟列表 | 大数据列表、菜单节点、动态高度列表 |

---

## PltIcon 图标组件

### 组件用途

`PltIcon` 用于统一渲染多种图标来源：

- Element Plus SVG 图标组件；
- 旧项目中的 `el-icon-*` / `icon-*` 字体类名；
- 直接传入的 SVG 字符串。

### 使用方法

```vue
<template>
  <div class="icon-demo">
    <PltIcon icon="Search" :size="18" color="#409eff" />
    <PltIcon icon="el-icon-edit" :size="18" color="#67c23a" />
    <PltIcon icon="icon-plt-home" :size="18" />
    <PltIcon :svg="rawSvg" :size="22" color="#e6a23c" />
  </div>
</template>

<script lang="ts" setup>
import { PltIcon } from '@io-platform/core-ui/components';

const rawSvg = `
<svg viewBox="0 0 1024 1024">
  <path d="M512 64 896 896H128z" />
</svg>`;
</script>
```

### 常用按钮/交互示例

```vue
<template>
  <div class="toolbar">
    <button @click="icon = 'Search'">搜索图标</button>
    <button @click="icon = 'Setting'">设置图标</button>
    <button @click="icon = 'Delete'">删除图标</button>

    <PltIcon :icon="icon" :size="20" color="#409eff" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { PltIcon } from '@io-platform/core-ui/components';

const icon = ref('Search');
</script>
```

### 使用效果

- 传入 `Search`、`Setting` 等 Element Plus 图标名时，渲染 SVG 图标组件；
- 传入旧字体图标类名时，会先尝试映射为 Element Plus 图标，映射不到则保留 `iconfont` class 渲染；
- 传入 `svg` 字符串时，会直接渲染内联 SVG，并自动处理内部 `id` 冲突；
- `size` 控制字号或 SVG 尺寸，`color` 控制图标颜色。

---

## PltLoading Loading 组件

### 组件用途

`PltLoading` 提供两种使用方式：

- `PltLoading.service(options)`：命令式打开/关闭 loading；
- `v-pltLoading`：指令式根据布尔值自动打开/关闭 loading。

### 使用方法：service 调用

```vue
<template>
  <div ref="panelRef" class="loading-panel">
    这里是需要被 loading 覆盖的内容区域
  </div>

  <button @click="openLocalLoading">局部 Loading</button>
  <button @click="openFullscreenLoading">全屏 Loading</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { PltLoading } from '@io-platform/core-ui/components/plt-loading';

const panelRef = ref<HTMLElement>();

const openLocalLoading = () => {
  const loading = PltLoading.service({
    target: panelRef.value,
  });

  setTimeout(() => loading.close(), 1200);
};

const openFullscreenLoading = () => {
  const loading = PltLoading.service({
    target: document.body,
    fullscreen: true,
    lock: true,
  });

  setTimeout(() => loading.close(), 1200);
};
</script>
```

### 使用方法：指令调用

```vue
<template>
  <div v-pltLoading="loading" class="loading-panel">
    指令 loading 内容区域
  </div>

  <button @click="loading = !loading">
    {{ loading ? '关闭 Loading' : '打开 Loading' }}
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const loading = ref(false);
</script>
```

如果要使用指令，需要先安装插件：

```ts
import { PltLoading } from '@io-platform/core-ui';

app.use(PltLoading);
```

### 常用按钮/交互示例

| 按钮 | 示例代码 | 效果 |
| --- | --- | --- |
| 打开局部 Loading | `PltLoading.service({ target: panelRef.value })` | 只遮罩目标 DOM 区域 |
| 打开全屏 Loading | `PltLoading.service({ target: document.body, fullscreen: true, lock: true })` | 遮罩整页并锁定滚动 |
| 关闭 Loading | `loadingInstance.close()` | 移除 loading class 并还原 `z-index` |
| 指令切换 | `loading = !loading` | 根据布尔值自动打开/关闭 |

### 使用效果

- 目标元素会添加 `plt-loading-parent--relative` 和 `plt-loading_wrap`；
- 遮罩通过 `::after` 伪元素展示，默认显示 loading gif；
- 同一个目标支持多个 loading 引用计数，最后一个关闭时才移除遮罩；
- 全屏 loading 是单例，新全屏 loading 会先关闭旧实例。

---

## pltMenu 虚拟树形菜单

### 组件用途

`pltMenu` 是基于 `PltVirtuallyList` 的树形菜单组件，适用于后台左侧导航、应用菜单和多级路由菜单。

支持能力：

- 树形菜单扁平化渲染；
- 虚拟滚动；
- 展开/收起；
- 当前节点高亮；
- 关键字过滤；
- 折叠模式级联浮层；
- `vue-router` 跳转。

### 使用方法

```vue
<template>
  <div class="menu-demo">
    <plt-menu
      ref="menuRef"
      :data="menus"
      :min-size="42"
      :default-expanded-keys="['/system/user']"
      default-active="/system/user"
      router
      @node-click="handleNodeClick"
    >
      <template #icon="{ node }">
        <PltIcon :icon="node.isLeaf ? 'Document' : 'Folder'" :size="16" />
      </template>

      <template #content="{ node }">
        <span class="menu-text">{{ node.label }}</span>
      </template>
    </plt-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { PltIcon } from '@io-platform/core-ui/components';

const menuRef = ref<any>();

const menus = [
  {
    id: 'home',
    label: '首页',
    path: '/home',
  },
  {
    id: 'system',
    label: '系统管理',
    children: [
      { id: 'system-user', label: '用户管理', path: '/system/user' },
      { id: 'system-role', label: '角色管理', path: '/system/role' },
    ],
  },
];

const handleNodeClick = (data: any, node: any) => {
  console.log('点击菜单：', data, node);
};
</script>

<style scoped>
.menu-demo {
  height: 420px;
}
</style>
```

### 常用按钮/交互示例

```vue
<template>
  <div class="menu-actions">
    <button @click="menuRef?.expandAllNodes()">展开全部</button>
    <button @click="menuRef?.collapseAllNods()">收起全部</button>
    <button @click="menuRef?.setCurrentKey('system-user')">选中用户管理</button>
    <button @click="menuRef?.filter('用户')">过滤“用户”</button>
    <button @click="menuRef?.scrollToTop()">滚动到顶部</button>
  </div>
</template>
```

### 使用效果

- 菜单数据按树结构展示，展开后子级缩进显示；
- 节点数量很大时只渲染可视区域，减少 DOM 压力；
- 开启 `router` 后，点击带 `path` 的节点会调用 `router.push(node.path)`；
- 设置 `collapse` 后，主菜单收窄，鼠标移入有子级的节点会在 `body` 下渲染级联浮层；
- 调用 `filter('关键字')` 后，匹配节点和祖先节点保留并展开，其余节点隐藏。

---

## PltObserverItem 尺寸观测项

### 组件用途

`PltObserverItem` 是一个轻量包装组件，用于把子内容注册到外部传入的 `ResizeObserver` 中。它当前主要被 `PltVirtuallyList` 用来观测每个虚拟列表项的真实尺寸。

### 使用方法

```vue
<template>
  <PltObserverItem
    id="row-1"
    full-path="系统管理/用户管理"
    :resize-observer="resizeObserver"
    class="observer-row"
  >
    <div>被观测的内容</div>
  </PltObserverItem>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from 'vue';
import { PltObserverItem } from '@io-platform/core-ui/components';

const resizeObserver = new ResizeObserver(entries => {
  entries.forEach(entry => {
    console.log(entry.target, entry.contentRect.height);
  });
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
});
</script>
```

### 常用按钮/交互示例

```vue
<template>
  <button @click="expanded = !expanded">
    {{ expanded ? '收起内容' : '展开内容' }}
  </button>

  <PltObserverItem id="demo" :resize-observer="resizeObserver">
    <div :style="{ height: expanded ? '120px' : '40px' }">
      高度变化内容
    </div>
  </PltObserverItem>
</template>
```

### 使用效果

- 渲染结果是一个普通 `div`；
- 根节点会带上 `data-id` 和 `full-path` 属性；
- 内容尺寸变化时，外部 `ResizeObserver` 会收到变化通知；
- 通常不需要业务直接使用，除非需要自己封装可观测尺寸的列表项。

---

## pltTree 树形控件

### 组件用途

`pltTree` 是基于 `vxe-grid` 的树形控件，适合需要树表格能力的场景。

支持能力：

- 树数据展示；
- 默认展开；
- 当前行高亮；
- checkbox 勾选；
- 搜索过滤；
- 拖拽排序；
- 大数据虚拟滚动能力由 `vxe-grid` 承担。

### 使用方法

```vue
<template>
  <plt-tree
    ref="treeRef"
    :data="treeData"
    :default-expanded-keys="[1]"
    :current-node-key="2"
    show-checkbox
    highlight-current
    @node-click="handleNodeClick"
    @check-change="handleCheckChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const treeRef = ref<any>();

const treeData = [
  {
    id: 1,
    parentId: null,
    label: '系统管理',
    children: [
      { id: 2, parentId: 1, label: '用户管理' },
      { id: 3, parentId: 1, label: '角色管理' },
    ],
  },
  {
    id: 4,
    parentId: null,
    label: '日志管理',
  },
];

const handleNodeClick = (row: any) => {
  console.log('点击节点：', row);
};

const handleCheckChange = (row: any, checked: boolean) => {
  console.log('勾选变化：', row, checked);
};
</script>
```

### 常用按钮/交互示例

```vue
<template>
  <div class="tree-actions">
    <button @click="treeRef?.setCurrentRow(2)">选中用户管理</button>
    <button @click="treeRef?.clearCurrentRow()">清除选中</button>
    <button @click="treeRef?.setCheckedRow([2, 3])">勾选用户和角色</button>
    <button @click="treeRef?.clearCheckedRow()">清除勾选</button>
    <button @click="treeRef?.filter('用户')">搜索用户</button>
    <button @click="treeRef?.clearTreeExpand()">收起全部</button>
  </div>
</template>
```

### 使用效果

- 以树表格形式展示层级数据；
- `show-checkbox` 开启后，每行可以勾选；
- `filter(value)` 会按字段过滤树节点，并保留命中的父级链路；
- `setCurrentRow(id)` 会把指定节点设置为当前高亮行；
- 开启 `draggable` 后，可通过拖拽调整节点顺序，拖拽结束触发 `drag-end`。

### 常用 Props

| 参数 | 说明 |
| --- | --- |
| `data` | 树数据 |
| `empty-text` | 空数据文案 |
| `highlight-current` | 是否高亮当前节点 |
| `default-expanded-keys` | 默认展开节点 key 数组 |
| `show-checkbox` | 是否显示勾选框 |
| `default-checked-keys` | 默认勾选 key 数组 |
| `current-node-key` | 当前选中节点 key |
| `draggable` | 是否允许拖拽 |

---

## PltVirtuallyList 虚拟列表

### 组件用途

`PltVirtuallyList` 用于渲染大数据量列表。它只渲染当前可视区域和 buffer 范围内的数据项，通过虚拟占位撑开滚动高度。

适合：

- 大数据列表；
- 菜单树扁平节点；
- 动态高度列表；
- 需要手动滚动控制的列表。

### 使用方法

```vue
<template>
  <div class="virtual-demo">
    <PltVirtuallyList
      ref="listRef"
      :list="list"
      item-key="id"
      :min-size="40"
      :buffer="6"
      @to-bottom="loadMore"
    >
      <template #default="{ itemData, index }">
        <div class="virtual-row">
          {{ index }} - {{ itemData.name }}
        </div>
      </template>

      <template #empty>
        <div class="empty">暂无数据</div>
      </template>
    </PltVirtuallyList>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { PltVirtuallyList } from '@io-platform/core-ui/components';

const listRef = ref<any>();
const list = ref(
  Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    name: `第 ${index + 1} 项`,
  }))
);

const loadMore = () => {
  console.log('滚动到底部，可以加载更多');
};
</script>

<style scoped>
.virtual-demo {
  height: 360px;
}

:deep(.plt-virtually-list__client) {
  height: 100%;
  overflow-y: auto;
}

.virtual-row {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}
</style>
```

### 常用按钮/交互示例

```vue
<template>
  <div class="virtual-actions">
    <button @click="listRef?.scrollToTop()">回到顶部</button>
    <button @click="listRef?.scrollToIndex(100)">滚动到第 100 项</button>
    <button @click="listRef?.scrollIntoView(500)">确保第 500 项可见</button>
    <button @click="listRef?.scrollToBottom()">滚动到底部</button>
    <button @click="listRef?.reset()">重置列表状态</button>
  </div>
</template>
```

### 使用效果

- 1 万条数据也只会渲染当前可视区域附近的少量 DOM；
- 动态高度内容会通过 `ResizeObserver` 自动记录真实尺寸；
- `fixed` 为 `true` 时按固定高度快速计算，性能更好；
- `to-bottom` 可以作为分页加载触发点；
- 通过组件实例方法可以控制滚动到顶部、底部、指定下标或指定偏移量。

### 常用 Props

| 参数 | 说明 |
| --- | --- |
| `list` | 列表数据 |
| `item-key` | 数据唯一键字段，必填 |
| `min-size` | 单项最小/预估高度 |
| `fixed` | 是否固定高度 |
| `buffer` | 可视区域外额外渲染数量 |
| `buffer-top` | 顶部额外渲染数量 |
| `buffer-bottom` | 底部额外渲染数量 |
| `horizontal` | 是否横向虚拟滚动 |
| `start` | 初始滚动到的下标 |
| `offset` | 初始滚动偏移量 |

## 推荐使用方式

1. 应用入口统一引入 `@io-platform/core-ui/style.css`；
2. 业务页面优先使用全局注册后的 kebab-case 组件名，例如 `<plt-menu />`、`<plt-tree />`；
3. 只在局部特殊场景中从 `@io-platform/core-ui/components` 引入单个组件；
4. 不再使用 `@io-platform/core-ui/src/...` 深层源码路径；
5. `PltLoading` 推荐通过 `@io-platform/core-ui/components/plt-loading` 引入，便于保持 public API 稳定。
