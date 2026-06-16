# PltMobileContainer

基于 `splitpanes` 封装的多面板布局容器。支持任意数量的左右分栏或上下分栏，适合配置区、编辑区、移动端预览区等需要拖拽调整尺寸的场景。

## 多列布局

尺寸配置方式接近 CSS `display: flex`：每个面板只用 `width`、`minWidth`、`maxWidth`、`flex` 控制主轴尺寸。

```vue
<template>
  <plt-mobile-container
    :data="panes"
    orientation="row"
    @size-change="handleSizeChange"
  >
    <template #config>
      <div class="panel">配置区</div>
    </template>

    <template #editor>
      <div class="panel">编辑区，自动占据剩余空间</div>
    </template>

    <template #preview>
      <div class="phone-preview">移动端预览</div>
    </template>
  </plt-mobile-container>
</template>

<script setup lang="ts">
const panes = [
  { key: 'config', slot: 'config', width: 320, minWidth: 240, maxWidth: 480 },
  { key: 'editor', slot: 'editor', minWidth: '20%', flex: 1 },
  { key: 'preview', slot: 'preview', width: '375px', minWidth: 320 },
];

const handleSizeChange = event => {
  console.log(event.paneSizes);
};
</script>
```

## 自动占据剩余空间

没写 `width` 的面板会自动占据剩余空间；多个自动面板会按 `flex` 权重分配。`flex` 的优先级最低，只在没有 `width` 或需要分配剩余空间时生效。

```ts
const panes = [
  { key: 'nav', slot: 'nav', width: 240, minWidth: 160 },
  { key: 'content', slot: 'content', minWidth: 300, flex: 2 },
  { key: 'extra', slot: 'extra', minWidth: 240, flex: 1 },
];
```

## 上下布局

`orientation="column"` 表示上下分栏。为了保持 API 简洁，仍然使用 `width` / `minWidth` / `maxWidth`，但它们表示主轴尺寸，也就是高度。

```vue
<template>
  <plt-mobile-container :data="panes" orientation="column">
    <template #pane-0>
      <div>上方区域</div>
    </template>

    <template #pane-1>
      <div>下方区域，自动占据剩余高度</div>
    </template>
  </plt-mobile-container>
</template>

<script setup lang="ts">
const panes = [
  { key: 'top', width: 300, minWidth: 120 },
  { key: 'bottom', minWidth: '30%', flex: 1 },
];
</script>
```

## 默认作用域插槽

```vue
<template>
  <plt-mobile-container :data="panes">
    <template #default="{ pane, index, size, data }">
      <component :is="data.component" :pane="pane" :index="index" :size="size" />
    </template>
  </plt-mobile-container>
</template>
```

## 兼容两栏用法

未传 `data` 时，组件会保留 `left` + `preview` 的两栏行为。

```vue
<template>
  <plt-mobile-container
    :left-default-width="480"
    :left-min-width="240"
    :right-min-width="375"
    @resized="handleResized"
  >
    <template #left>
      <div class="editor-panel">编辑区</div>
    </template>

    <template #preview>
      <div class="phone-preview">移动端预览</div>
    </template>
  </plt-mobile-container>
</template>
```

## Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `data` | 面板配置数组；传入后按数组渲染任意数量面板 | `PltMobileContainerPaneConfig[]` | `undefined` |
| `orientation` | 布局方向，`row` 为左右分栏，`column` 为上下分栏 | `'row' \| 'column'` | 根据 `horizontal` 兼容推导 |
| `splitpanesClass` | 透传给 `Splitpanes` 的类名 | `string \| object \| array` | `undefined` |
| `splitpanesStyle` | 透传给 `Splitpanes` 的样式 | `string \| object \| array` | `undefined` |
| `rtl` | 是否使用 RTL 方向 | `boolean` | `false` |
| `firstSplitter` | 是否展示首个分割条 | `boolean` | `false` |
| `horizontal` | 兼容旧 API；`true` 等价于 `orientation="column"` | `boolean` | `false` |
| `pushOtherPanes` | 是否在拖拽时推动其他面板 | `boolean` | `false` |
| `dblClickSplitter` | 是否允许双击分割条最大化面板 | `boolean` | `false` |
| `leftDefaultWidth` | 兼容两栏模式：左侧默认宽度 | `number` | `400` |
| `leftMinWidth` | 兼容两栏模式：左侧最小宽度 | `number` | `80` |
| `rightMinWidth` | 兼容两栏模式：右侧最小宽度 | `number` | `320` |

## Pane Data

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 面板唯一标识 | `string \| number` |
| `slot` | 面板对应的命名插槽 | `string` |
| `width` | 主轴默认尺寸；`row` 中表示宽度，`column` 中表示高度 | `number \| string` |
| `minWidth` | 主轴最小尺寸 | `number \| string` |
| `maxWidth` | 主轴最大尺寸 | `number \| string` |
| `flex` | 剩余空间分配权重，优先级低于 `width` | `number` |
| `class` | 面板类名 | `unknown` |
| `style` | 面板样式 | `unknown` |
| `attrs` | 透传到 `Pane` 的属性 | `Record<string, unknown>` |
| `data` | 用户自定义数据，会传给作用域插槽和事件 | `unknown` |

尺寸规则：

- `number` 和 `'320px'` 按像素处理。
- `'30%'` 按百分比处理。
- `'2rem'` 会按根字号换算为像素。
- 没写 `width` 的面板会自动分配剩余空间。
- 多个自动面板会按 `flex` 权重分配剩余空间；未写 `flex` 时按 `1` 处理。
- 像素值会按当前布局方向转换为 `splitpanes` 需要的百分比。

## Slots

| 插槽 | 说明 |
| --- | --- |
| `pane.slot` | `data` 中配置的命名插槽 |
| `pane-${index}` | 未配置 `slot` 时可按索引提供插槽，如 `pane-0` |
| `default` | 作用域默认插槽，参数为 `{ pane, index, size, data }` |
| `left` | 兼容两栏模式：左侧区域 |
| `preview` | 兼容两栏模式：右侧预览区域 |
| `right` | 兼容两栏模式：`preview` 的兜底 |

## Events

| 事件 | 说明 |
| --- | --- |
| `resize` | 分割条拖拽过程中触发 |
| `resized` | 分割条拖拽结束后触发 |
| `size-change` | `resized` 的语义化别名，适合保存最终尺寸 |

事件会保留 `splitpanes` 原始字段，并额外包含：

```ts
{
  orientation: 'row' | 'column',
  containerSize: number,
  paneSizes: [
    {
      index: number,
      key?: string | number,
      sizePercent: number,
      minSizePercent: number,
      maxSizePercent: number,
      sizePx: number,
      minSizePx: number,
      maxSizePx: number,
      config?: PltMobileContainerPaneConfig,
    },
  ],
}
```
