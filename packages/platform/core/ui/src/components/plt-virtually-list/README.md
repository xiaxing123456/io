# PltVirtuallyList 使用文档

本文档对应当前组件实现：[plt-virtually-list.tsx](./plt-virtually-list.tsx) 和核心逻辑：[use-virtually-list.ts](./composables/use-virtually-list.ts)。

## 1. 组件定位

PltVirtuallyList 是一个 Vue 3 虚拟列表组件，用于渲染大数据量列表。它只渲染当前可视区域及 buffer 范围内的节点，通过虚拟占位撑开整体滚动高度，从而减少 DOM 数量。

当前实现支持：

- 纵向虚拟滚动；
- 横向虚拟滚动；
- 固定尺寸列表；
- 动态尺寸列表，内部通过 `ResizeObserver` 记录每个节点的实际尺寸；
- 顶部 / 底部 buffer；
- 滚动到指定下标、指定偏移量、顶部、底部；
- 空数据插槽；
- 滚动、到顶、到底、节点尺寸变化、可视范围变化事件。

## 2. 文件结构

```text
plt-virtually-list/
├── README.md
├── plt-virtually-list.enum.ts
├── plt-virtually-list.tsx
├── plt-virtually-list.type.ts
└── composables/
    └── use-virtually-list.ts
```

| 文件 | 说明 |
| --- | --- |
| [plt-virtually-list.tsx](./plt-virtually-list.tsx) | 组件入口，定义 props、events、slots 渲染结构。 |
| [composables/use-virtually-list.ts](./composables/use-virtually-list.ts) | 虚拟列表核心逻辑，负责范围计算、尺寸缓存、滚动控制。 |
| [plt-virtually-list.type.ts](./plt-virtually-list.type.ts) | props、事件、内部响应式数据和返回方法类型定义。 |
| [plt-virtually-list.enum.ts](./plt-virtually-list.enum.ts) | 滚动方向枚举。 |

## 3. 注册与引入

组件已在 [components/index.ts](../index.ts) 中导出，并通过 `platformUIComponents` 统一注册。

在已接入 `@io-platform/core-ui` 的业务应用中，可以直接使用 kebab-case 组件名：

```vue
<template>
  <plt-virtually-list :list="list" item-key="id" :min-size="40">
    <template #default="{ itemData, index }">
      <div class="list-item">
        {{ index }} - {{ itemData.name }}
      </div>
    </template>
  </plt-virtually-list>
</template>
```

如果需要局部引入：

```ts
import { PltVirtuallyList } from '@io-platform/core-ui/components';
```

## 4. 基础用法

### 4.1 纵向列表

```vue
<template>
  <div class="demo-page">
    <plt-virtually-list
      :list="list"
      item-key="id"
      :min-size="40"
      :buffer="5"
      @to-bottom="handleToBottom"
    >
      <template #default="{ itemData, index }">
        <div class="list-item">
          <span>{{ index }}</span>
          <span>{{ itemData.name }}</span>
        </div>
      </template>

      <template #empty>
        <div class="empty">暂无数据</div>
      </template>
    </plt-virtually-list>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface ListItem {
  id: number;
  name: string;
}

const list = ref<ListItem[]>(
  Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    name: `第 ${index + 1} 项`,
  }))
);

const handleToBottom = (lastItem: ListItem) => {
  console.log('滚动到底部：', lastItem);
};
</script>

<style lang="scss" scoped>
.demo-page {
  height: 400px;
}

:deep(.plt-virtually-list__client) {
  height: 100%;
  overflow-y: auto;
}

.list-item {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}

.empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>
```

> 注意：组件根节点只输出 `plt-virtually-list__client` class，不内置高度和 overflow。使用方必须给滚动容器设置明确高度和 `overflow`，否则无法形成可滚动区域。

### 4.2 固定尺寸列表

如果每一项高度固定，建议开启 `fixed`，组件会直接用 `minSize * list.length` 计算总高度，不需要逐项累加尺寸，性能更好。

```vue
<template>
  <plt-virtually-list
    :list="list"
    item-key="id"
    :min-size="36"
    fixed
    :buffer="8"
  >
    <template #default="{ itemData }">
      <div class="fixed-item">{{ itemData.name }}</div>
    </template>
  </plt-virtually-list>
</template>
```

```scss
:deep(.plt-virtually-list__client) {
  height: 360px;
  overflow-y: auto;
}

.fixed-item {
  height: 36px;
  line-height: 36px;
}
```

### 4.3 动态尺寸列表

默认 `fixed` 为 `false`。组件会把 `minSize` 作为预估尺寸，并在节点渲染后通过 `ResizeObserver` 更新真实尺寸。

```vue
<template>
  <plt-virtually-list :list="list" item-key="id" :min-size="48" :buffer="4">
    <template #default="{ itemData }">
      <div class="dynamic-item">
        <div class="title">{{ itemData.title }}</div>
        <div class="content">{{ itemData.content }}</div>
      </div>
    </template>
  </plt-virtually-list>
</template>
```

适用场景：每一项高度可能不同，例如消息列表、菜单树、搜索结果卡片等。

### 4.4 横向列表

设置 `horizontal` 后，组件使用横向滚动尺寸：

- `minSize` 表示最小宽度；
- 内部滚动偏移使用 `scrollLeft`；
- 内层列表会自动加 `display: flex` 和 `min-width`。

```vue
<template>
  <plt-virtually-list
    :list="list"
    item-key="id"
    :min-size="120"
    horizontal
    :buffer="3"
  >
    <template #default="{ itemData }">
      <div class="horizontal-item">{{ itemData.name }}</div>
    </template>
  </plt-virtually-list>
</template>

<style lang="scss" scoped>
:deep(.plt-virtually-list__client) {
  width: 100%;
  height: 120px;
  overflow-x: auto;
  overflow-y: hidden;
}

.horizontal-item {
  width: 120px;
  height: 100px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 4.5 自定义列表容器 class

`listClass` 会加在内部列表容器上。默认值是 `virtually-menu-container`。

```vue
<template>
  <plt-virtually-list
    :list="list"
    item-key="id"
    list-class="my-virtual-list"
  >
    <template #default="{ itemData }">
      <div>{{ itemData.name }}</div>
    </template>
  </plt-virtually-list>
</template>
```

## 5. Props

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `list` | `Array<Record<string, any>>` | `[]` | 否 | 列表数据。 |
| `itemKey` | `string \| number` | - | 是 | 数据项唯一标识字段名，例如 `id`。组件会用 `item[itemKey]` 作为 vnode key 和尺寸缓存 key。 |
| `minSize` | `number` | `20` | 否 | 单项最小 / 预估尺寸。纵向列表表示高度，横向列表表示宽度。 |
| `fixed` | `boolean` | `false` | 否 | 是否固定尺寸。固定尺寸列表建议开启，可减少尺寸计算。 |
| `buffer` | `number` | `0` | 否 | 可视区域外额外渲染数量，同时作用于顶部和底部。 |
| `bufferTop` | `number` | `0` | 否 | 顶部额外渲染数量。优先级高于 `buffer`。 |
| `bufferBottom` | `number` | `0` | 否 | 底部额外渲染数量。优先级高于 `buffer`。 |
| `scrollDistance` | `number` | `0` | 否 | 到顶 / 到底事件触发阈值。 |
| `horizontal` | `boolean` | `false` | 否 | 是否横向虚拟滚动。 |
| `start` | `number` | `0` | 否 | 挂载后滚动到的起始下标。 |
| `offset` | `number` | `0` | 否 | 挂载后滚动到的起始偏移量。`start` 存在时优先使用 `start`。 |
| `listClass` | `string` | `virtually-menu-container` | 否 | 内部列表容器 class。 |

### 5.1 buffer 说明

组件挂载前会计算：

```ts
bufferTop = props.bufferTop || props.buffer;
bufferBottom = props.bufferBottom || props.buffer;
```

因此：

- 只传 `buffer`：上下使用同一个 buffer；
- 同时传 `bufferTop` / `bufferBottom`：分别控制上下 buffer；
- `bufferTop` 或 `bufferBottom` 为 `0` 时，会回退使用 `buffer`。

## 6. Slots

### 6.1 default

默认插槽用于渲染每一项。

```vue
<template #default="{ itemData, index }">
  <div>{{ index }} - {{ itemData.name }}</div>
</template>
```

| 插槽参数 | 类型 | 说明 |
| --- | --- | --- |
| `itemData` | `T` | 当前数据项。 |
| `index` | `number` | 当前数据项在完整列表中的真实下标。 |

### 6.2 empty

当实际渲染列表为空时渲染。组件会给空状态外层加一个和可视区域同高的容器。

```vue
<template #empty>
  <div class="empty">暂无数据</div>
</template>
```

## 7. Events

| 事件名 | 参数 | 触发时机 |
| --- | --- | --- |
| `scroll` | `(evt: Event)` | 滚动容器触发 scroll 时。 |
| `toTop` | `(firstItem: T)` | 向上滚动且滚动距离小于等于 `scrollDistance` 时。 |
| `toBottom` | `(lastItem: T)` | 向下滚动且滚动距离到达底部阈值时。 |
| `itemResize` | `(id: string, newSize: number)` | 某个列表项真实尺寸变化时。 |
| `rangeUpdate` | `(begin: number, end: number)` | 可视区域起止下标变化时。 |

示例：

```vue
<template>
  <plt-virtually-list
    :list="list"
    item-key="id"
    :min-size="40"
    :scroll-distance="20"
    @scroll="handleScroll"
    @to-top="handleToTop"
    @to-bottom="handleToBottom"
    @item-resize="handleItemResize"
    @range-update="handleRangeUpdate"
  >
    <template #default="{ itemData }">
      <div class="list-item">{{ itemData.name }}</div>
    </template>
  </plt-virtually-list>
</template>
```

## 8. 组件实例方法

组件 `setup` 会返回虚拟列表方法，可通过组件 ref 调用。

```vue
<template>
  <div class="page">
    <div class="toolbar">
      <button @click="scrollTo100">滚动到第 100 项</button>
      <button @click="scrollTop">回到顶部</button>
      <button @click="scrollBottom">滚动到底部</button>
    </div>

    <plt-virtually-list
      ref="virtuallyListRef"
      :list="list"
      item-key="id"
      :min-size="40"
      fixed
    >
      <template #default="{ itemData }">
        <div class="list-item">{{ itemData.name }}</div>
      </template>
    </plt-virtually-list>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const virtuallyListRef = ref<any>();

const scrollTo100 = () => {
  virtuallyListRef.value?.scrollToIndex(100);
};

const scrollTop = () => {
  virtuallyListRef.value?.scrollToTop();
};

const scrollBottom = () => {
  virtuallyListRef.value?.scrollToBottom();
};
</script>
```

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| `getOffset()` | - | 获取当前滚动偏移。纵向为 `scrollTop`，横向为 `scrollLeft`。 |
| `reset()` | - | 重置虚拟列表状态，并清空尺寸缓存。 |
| `scrollToIndex(index)` | `index: number` | 滚动到指定下标。动态尺寸场景会尝试修正偏移。 |
| `scrollIntoView(index)` | `index: number` | 如果指定下标不在可视区域内，则滚动到可视区域。 |
| `scrollToTop()` | - | 滚动到顶部。 |
| `scrollToBottom()` | - | 滚动到底部，并做误差修正。 |
| `scrollToOffset(offset)` | `offset: number` | 滚动到指定偏移量。 |
| `manualRender(begin, end)` | `begin: number, end: number` | 手动设置实际渲染范围。一般业务无需调用。 |
| `getItemSize(itemKey)` | `itemKey: string` | 获取指定数据 key 对应节点尺寸。 |
| `getItemPosByIndex(index)` | `index: number` | 获取指定下标节点的位置 `{ top, current, bottom }`。横向场景中这几个字段仍复用同名字段表示横向位置。 |
| `forceUpdate()` | - | 强制重新计算渲染列表。 |

## 9. 样式要求

组件只负责输出结构和动态尺寸，不内置滚动容器样式。推荐业务侧至少提供：

```scss
:deep(.plt-virtually-list__client) {
  height: 100%;
  overflow-y: auto;
}
```

如果外层没有固定高度，可直接给组件滚动容器设置固定高度：

```scss
:deep(.plt-virtually-list__client) {
  height: 400px;
  overflow-y: auto;
}
```

列表项建议设置 `box-sizing: border-box`，避免 padding / border 导致预估尺寸和实际尺寸偏差过大：

```scss
.list-item {
  min-height: 40px;
  box-sizing: border-box;
}
```

## 10. 使用建议

1. `itemKey` 必须稳定且唯一，不建议使用数组下标作为 key。
2. 如果列表项尺寸固定，开启 `fixed` 并让 `minSize` 等于真实尺寸。
3. 如果列表项尺寸动态，`minSize` 应尽量接近平均尺寸，减少首次滚动偏差。
4. 大量快速滚动场景建议设置合适的 `buffer`，避免边界处出现短暂空白。
5. 列表数据整体替换但长度不变时，可以调用 `forceUpdate()` 强制刷新渲染内容。
6. 列表数据清空时，组件会自动调用 `reset()` 重置状态。

## 11. 常见问题

### 11.1 为什么页面没有滚动？

确认 `.plt-virtually-list__client` 是否有明确高度和 `overflow-y: auto` / `overflow: auto`。

### 11.2 为什么滚动到指定下标有偏差？

动态尺寸列表首次滚动时只能先按 `minSize` 估算位置，节点渲染并被 `ResizeObserver` 测量后才会逐步修正。可以让 `minSize` 更接近真实平均尺寸，或者在固定尺寸场景开启 `fixed`。

### 11.3 `toBottom` 为什么重复触发？

`toBottom` 在滚动事件中判断当前位置是否到达底部阈值。用户持续停留在底部附近并继续触发滚动事件时，可能重复触发。需要分页加载时，业务侧建议增加 loading 锁，避免重复请求。

### 11.4 横向滚动时为什么子项被压缩？

横向模式内层列表会使用 `display: flex`，子项需要设置固定宽度或 `flex-shrink: 0`。
