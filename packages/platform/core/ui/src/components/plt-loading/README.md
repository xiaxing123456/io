# PltLoading 使用文档

本文档对应根目录示例实现：[plt-loading/](./)。这版实现按平台原组件结构拆分，但去掉了旧实现中未真正生效的 `visible`、`stepVisible`、`iconVisible`、`svg`、`spinner`、`vm`、`$el` 等字段，只保留当前实际需要的能力。

## 1. 组件定位

PltLoading 是一个 loading 工具组件，提供两种使用方式：

1. **service 调用**：通过 `PltLoading.service(options)` 主动打开 loading，并通过返回实例的 `close()` 关闭。
2. **指令调用**：通过 `v-pltLoading="loading"` 随布尔值变化自动打开或关闭 loading。

当前实现的展示方式是：

- 给目标元素添加 `plt-loading-parent--relative`；
- 给目标元素添加 `plt-loading_wrap`；
- [plt-loading.scss](./plt-loading.scss) 通过 `::after` 伪元素显示遮罩和 loading gif；
- 关闭时移除 class，并还原 `z-index`。

## 2. 文件结构

```text
plt-loading/
├── index.ts
├── plt-loading.scss
└── src/
    ├── constants.ts
    ├── directive.ts
    ├── index.ts
    └── plt-loading.types.ts
```

| 文件 | 说明 |
| --- | --- |
| [index.ts](./index.ts) | 插件入口，注册 `pltLoading` 指令，并暴露 `service`。 |
| [src/index.ts](./src/index.ts) | service 主实现，负责 target 解析、class 管理、z-index、引用计数、全屏单例。 |
| [src/directive.ts](./src/directive.ts) | 指令实现，把 `v-pltLoading` 的生命周期转换成 service 创建/关闭。 |
| [src/plt-loading.types.ts](./src/plt-loading.types.ts) | 类型定义。 |
| [src/constants.ts](./src/constants.ts) | class 名、属性名、默认层级、实例缓存名。 |
| [plt-loading.scss](./plt-loading.scss) | loading 遮罩样式。 |

## 3. 安装注册

如果作为插件注册：

```ts
import { createApp } from 'vue';
import PltLoading from './plt-loading';

const app = createApp(App);

app.use(PltLoading);
```

注册后可在模板中使用：

```vue
<template>
    <div v-pltLoading="loading">
        内容区域
    </div>
</template>
```

## 4. service 用法

### 4.1 基础用法

```ts
import { PltLoading } from './plt-loading';

const loading = PltLoading.service({
    target: containerElement,
});

loading.close();
```

### 4.2 选择器 target

```ts
const loading = PltLoading.service({
    target: '.page-content',
});

loading.close();
```

如果选择器没有命中 DOM，会回退到 `document.body`。

### 4.3 全屏 loading

```ts
const loading = PltLoading.service({
    target: document.body,
    fullscreen: true,
    lock: true,
});

loading.close();
```

说明：

- `target` 最终是 `document.body` 时，才会按全屏 loading 处理；
- 全屏 loading 会走全屏单例逻辑，新全屏 loading 会先关闭旧全屏 loading；
- `lock: true` 会添加 `plt-loading-parent--hidden`，需要 [plt-loading.scss](./plt-loading.scss) 中的 `overflow: hidden` 配合。

### 4.4 自定义 class

```ts
const loading = PltLoading.service({
    target: containerElement,
    customClass: 'my-loading-class',
});

loading.close();
```

`customClass` 会追加到 parent 上，并在最后一个 loading 关闭时移除。

## 5. 指令用法

### 5.1 局部 loading

```vue
<template>
    <div v-pltLoading="loading">
        内容区域
    </div>
</template>
```

当 `loading` 从 `false` 变为 `true` 时创建 loading；从 `true` 变为 `false` 时关闭 loading。

### 5.2 全屏 loading

```vue
<template>
    <div v-pltLoading.fullscreen="loading">
        内容区域
    </div>
</template>
```

`.fullscreen` 会把 target 指向 `document.body`。

### 5.3 body 模式

```vue
<template>
    <div v-pltLoading.body="loading">
        内容区域
    </div>
</template>
```

`.body` 会让 service 按 body 模式计算 parent。

## 6. API

### 6.1 LoadingOptions

```ts
export interface LoadingOptions {
    target?: string | HTMLElement;
    fullscreen?: boolean;
    body?: boolean;
    lock?: boolean;
    customClass?: string;
}
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `target` | `string \| HTMLElement` | `document.body` | loading 覆盖目标。 |
| `fullscreen` | `boolean` | body 场景默认 true | 是否全屏。非 body target 会被修正为 false。 |
| `body` | `boolean` | `false` | 是否按 body 模式处理 parent。 |
| `lock` | `boolean` | `false` | 是否添加锁滚动 class。 |
| `customClass` | `string` | - | 追加到 parent 上的自定义 class。 |

### 6.2 LoadingInstance

```ts
export interface LoadingInstance {
    readonly parent: LoadingParentElement;
    readonly fullscreen: boolean;
    close: () => void;
}
```

| 字段 | 说明 |
| --- | --- |
| `parent` | 当前实例管理的 DOM 元素。 |
| `fullscreen` | 当前实例是否是全屏 loading。 |
| `close()` | 关闭当前 loading。方法是幂等的，重复调用不会重复扣减计数。 |

## 7. 关键实现机制

### 7.1 target 解析

[src/index.ts](./src/index.ts) 中的 `resolveTarget` 支持两种 target：

- 字符串：按 CSS 选择器查询 DOM；
- HTMLElement：直接使用。

没有传 target 或选择器未命中时，会使用 `document.body`。

### 7.2 parent 计算

`normalizeOptions` 会计算：

- `target`：实际覆盖目标；
- `body`：是否按 body 模式；
- `fullscreen`：是否全屏；
- `parent`：实际添加 class、记录计数、保存 z-index 的元素。

### 7.3 class 管理

打开 loading 时会添加：

- `plt-loading-parent--relative`
- `plt-loading_wrap`
- `plt-loading-parent--hidden`（仅 `fullscreen && lock`）
- `customClass`（如果传入）

关闭最后一个 loading 时会移除这些 class。

### 7.4 引用计数

同一个 parent 可能被多个异步请求同时加 loading，所以实现使用 `WeakMap` 保存 parent 状态，并同步写入 DOM 属性 `loading-number` 方便调试。

打开时：

- `loadingNumber += 1`

关闭时：

- `loadingNumber -= 1`
- 只有减到 0 时才移除 class 和还原 z-index。

### 7.5 z-index 保存和还原

第一次打开 parent loading 时：

- 保存旧的行内 `z-index`；
- 如果是普通局部 loading 且 computed `z-index` 是 `auto`，设置默认层级；
- 如果是全屏 loading，调用组件内部的 `getNextLoadingZIndex()` 获取层级。

最后一个 loading 关闭时：

- 还原旧的行内 `z-index`；
- 移除 `old-z-index` 属性。

## 8. z-index 生成策略

当前实现已经按“折中方案”处理：service 主流程不再直接依赖 `PopupManager`，而是调用组件内部的 `getNextLoadingZIndex()`。

当前代码：

```ts
let loadingZIndex = 1000;

const getNextLoadingZIndex = () => {
    loadingZIndex += 1;

    return loadingZIndex;
};
```

全屏 loading 使用时：

```ts
if (fullscreen) {
    parent.style.zIndex = getNextLoadingZIndex().toString();
    return;
}
```

这样做的好处：

- 根目录示例实现可以自包含，不强依赖平台 `PopupManager`；
- service 主流程只关心“获取下一个 loading 层级”，不关心层级来源；
- 后续如果要迁回平台组件并接入统一弹层层级，只需要替换 `getNextLoadingZIndex()` 的内部实现。

如果未来需要重新接入平台层级，可以改成：

```ts
import PopupManager from '@engine/utils/method/style/popup-manager';

const getNextLoadingZIndex = () => {
    return PopupManager.nextZIndex();
};
```

也就是说，`PopupManager` 没有直接散落在 service 主流程里，而是被隔离成一个可替换的层级策略。

## 9. 当前不再支持的旧字段

这版精简实现不再支持：

- `visible`
- `stepVisible`
- `stepNum`
- `iconVisible`
- `background`
- `text`
- `spinner`
- `svg`
- `svgViewBox`
- `vm`
- `$el`

原因是当前展示逻辑是 class + SCSS 伪元素，不是真实 Vue DOM 组件渲染。继续保留这些字段会让 API 看起来支持，但实际不生效。
