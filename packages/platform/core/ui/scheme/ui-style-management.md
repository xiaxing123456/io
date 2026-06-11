# @io-platform/core-ui UI 组件样式统一管理实现方案

## 1. 背景

`@io-platform/core-ui` 是平台级 UI 组件包，后续会持续沉淀 loading、icon、button、dialog、table 等通用组件。为了避免组件样式分散、变量硬编码、主题能力难扩展等问题，需要建立一套统一的样式组织方式。

当前包内 `plt-loading` 已经开始使用 `--plt-basic-background-color-rgb`、`--plt-basic-row-height` 等 CSS 变量，说明组件样式具备向设计 token 和主题变量演进的基础。

本方案目标是在不引入重型样式系统的前提下，通过 **CSS Variables + SCSS 分层 + 组件样式就近维护** 的方式统一管理组件样式。

## 2. 目标

- 统一管理颜色、字号、间距、圆角、高度、层级等基础设计变量。
- 组件样式命名规范统一，避免和业务项目或第三方组件库冲突。
- 支持后续主题切换，例如亮色、暗色、业务主题覆盖。
- 支持组件样式按需维护，同时提供全量样式入口。
- 降低后续新增组件时的样式维护成本。

## 3. 非目标

- 不在当前阶段引入 Tailwind CSS、CSS-in-JS、原子化 CSS 等额外方案。
- 不在当前阶段实现完整设计系统平台。
- 不强制一次性重构所有历史组件，可按组件逐步迁移。

## 4. 推荐目录结构

```txt
packages/platform/core/ui/
  src/
    index.ts

    styles/
      index.scss              # 样式总入口
      css-vars.scss           # CSS 变量和主题变量
      reset.scss              # 基础重置，可选
      mixins.scss             # 公共 mixin
      z-index.scss            # 层级变量，可选
      components.scss         # 组件样式聚合，可选

    components/
      plt-loading/
        index.ts
        style.scss
        src/
          index.ts
          constants.ts
          plt-loading.types.ts

      plt-icon/
        plt-icon.vue
        style.scss            # 如组件有独立样式，则新增
```

说明：

- `src/styles/index.scss` 是组件库样式总入口。
- `src/styles/css-vars.scss` 负责维护设计 token 和主题变量。
- 每个组件自己的样式文件放在组件目录下，推荐统一命名为 `style.scss`。
- 组件样式只消费统一变量，不直接散落硬编码颜色、层级和尺寸。

## 5. 样式分层设计

### 5.1 CSS 变量层

新建：

```txt
src/styles/css-vars.scss
```

示例：

```scss
:root,
[data-plt-theme='light'] {
  --plt-color-primary: #1677ff;
  --plt-color-text: #1f2329;
  --plt-color-text-secondary: #646a73;
  --plt-color-bg: #ffffff;
  --plt-color-bg-mask-rgb: 255, 255, 255;

  --plt-font-size-base: 14px;
  --plt-font-size-small: 12px;

  --plt-space-xs: 4px;
  --plt-space-sm: 8px;
  --plt-space-md: 12px;
  --plt-space-lg: 16px;

  --plt-border-radius-sm: 2px;
  --plt-border-radius-base: 4px;
  --plt-border-radius-lg: 8px;

  --plt-basic-row-height: 32px;

  --plt-z-index-loading: 1000;
  --plt-z-index-dialog: 2000;
  --plt-z-index-message: 3000;

  /* 兼容当前 plt-loading 已使用变量 */
  --plt-basic-background-color-rgb: var(--plt-color-bg-mask-rgb);
}

[data-plt-theme='dark'] {
  --plt-color-primary: #4096ff;
  --plt-color-text: #f0f0f0;
  --plt-color-text-secondary: #bfbfbf;
  --plt-color-bg: #141414;
  --plt-color-bg-mask-rgb: 20, 20, 20;

  --plt-basic-background-color-rgb: var(--plt-color-bg-mask-rgb);
}
```

原则：

- 运行时可能变化的值使用 CSS 变量。
- 颜色、主题、尺寸、层级优先从 CSS 变量读取。
- 业务侧可通过覆盖 CSS 变量实现定制。

### 5.2 SCSS 工具层

新建：

```txt
src/styles/mixins.scss
```

示例：

```scss
@mixin plt-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin plt-flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

原则：

- mixin 只放通用结构能力，不放具体业务组件样式。
- mixin 名称统一使用 `plt-` 前缀。

### 5.3 组件样式层

组件样式就近维护。例如 `plt-loading`：

```txt
src/components/plt-loading/style.scss
```

示例：

```scss
.plt-loading-parent--relative {
  position: relative;
}

.plt-loading-parent--hidden {
  overflow: hidden !important;
}

.plt-loading-parent--relative.plt-loading_wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(var(--plt-basic-background-color-rgb), 0.7);
  background-image: url('./src/assets/loading.gif');
  background-repeat: no-repeat;
  background-position: center;
  background-size: calc(var(--plt-basic-row-height) * 1.5) calc(var(--plt-basic-row-height) * 1.5);
  opacity: 0;
  animation: plt-loading-show 0.25s ease-in-out 0.25s forwards;
  z-index: inherit;
}

@keyframes plt-loading-show {
  to {
    opacity: 1;
  }
}
```

注意：

- `@keyframes` 也建议增加组件前缀，例如 `plt-loading-show`，避免全局冲突。
- 组件样式中的颜色、尺寸、层级尽量来自 CSS 变量。

### 5.4 样式总入口

新建：

```txt
src/styles/index.scss
```

示例：

```scss
@use './css-vars.scss';
@use './reset.scss';
@use './components.scss';
```

新建：

```txt
src/styles/components.scss
```

示例：

```scss
@use '../components/plt-loading/style.scss';
```

后续新增组件时，只需要追加：

```scss
@use '../components/plt-button/style.scss';
@use '../components/plt-dialog/style.scss';
```

## 6. 样式引入策略

### 6.1 默认推荐：提供全量样式入口

在组件库入口中引入全量样式：

```ts
// src/index.ts
import './styles/index.scss';

import PltIcon from './components/plt-icon/plt-icon.vue';

export const pltCommonComponents = [PltIcon];

const platformUIComponents = [...pltCommonComponents];

export { platformUIComponents };
```

优点：

- 业务侧使用简单。
- 适合内部平台组件库统一接入。
- 能保证 CSS 变量和组件样式一定存在。

缺点：

- 样式默认全量进入。
- 如果后续组件非常多，需要结合构建工具再做样式拆分。

### 6.2 可选增强：暴露独立样式入口

后续可以通过 package exports 增加样式入口，例如：

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./styles": "./src/styles/index.scss"
  }
}
```

业务侧可按需引入：

```ts
import '@io-platform/core-ui/styles';
```

当前阶段可以先不做 exports 改造，优先完成内部结构统一。

## 7. 命名规范

### 7.1 class 命名

统一使用 `plt-` 前缀，推荐 BEM 风格：

```txt
.plt-component
.plt-component__element
.plt-component--modifier
```

示例：

```scss
.plt-button {}
.plt-button__icon {}
.plt-button--primary {}
.plt-button--disabled {}
```

### 7.2 CSS 变量命名

统一使用 `--plt-` 前缀：

```txt
--plt-color-primary
--plt-color-text
--plt-space-md
--plt-border-radius-base
--plt-z-index-dialog
```

### 7.3 animation 命名

全局 keyframes 必须带组件前缀：

```scss
@keyframes plt-loading-show {}
@keyframes plt-dialog-fade-in {}
```

避免使用过于通用的名称：

```scss
/* 不推荐 */
@keyframes show {}
@keyframes fade-in {}
```

## 8. 主题定制方式

主题切换通过修改根节点属性完成：

```html
<html data-plt-theme="dark">
```

或者：

```ts
document.documentElement.setAttribute('data-plt-theme', 'dark');
```

业务系统如需自定义主题，可覆盖变量：

```scss
:root {
  --plt-color-primary: #0052d9;
  --plt-basic-row-height: 36px;
  --plt-border-radius-base: 6px;
}
```

组件内部不需要感知主题，只消费变量即可。

## 9. `plt-loading` 迁移建议

当前 `plt-loading` 已有文件：

```txt
src/components/plt-loading/plt-loading.scss
```

建议迁移为：

```txt
src/components/plt-loading/style.scss
```

并修改引用：

```ts
// src/components/plt-loading/src/index.ts
import '../style.scss';
```

同时建议调整：

- `@keyframes show` 改为 `@keyframes plt-loading-show`。
- `top/right/bottom/left` 可简化为 `inset: 0`。
- 保留已有 CSS 变量，后续由 `src/styles/css-vars.scss` 提供默认值。

## 10. 实施步骤

### 阶段一：建立样式基础设施

1. 新增 `src/styles/index.scss`。
2. 新增 `src/styles/css-vars.scss`。
3. 新增 `src/styles/mixins.scss`。
4. 新增 `src/styles/components.scss`。
5. 在 `src/index.ts` 中引入 `./styles/index.scss`。

### 阶段二：迁移现有组件样式

1. 将 `src/components/plt-loading/plt-loading.scss` 重命名为 `src/components/plt-loading/style.scss`。
2. 修改 `plt-loading` 内部样式引用路径。
3. 将 `@keyframes show` 改为 `@keyframes plt-loading-show`。
4. 在 `src/styles/components.scss` 中引入 `plt-loading/style.scss`。
5. 确认 loading 在业务侧仍能正常展示。

### 阶段三：约束后续新增组件

新增组件时必须遵循：

1. 组件目录下维护 `style.scss`。
2. class 使用 `plt-` 前缀。
3. 不直接硬编码平台色值、尺寸、z-index。
4. 组件样式引入到 `src/styles/components.scss`。
5. 如有新增基础变量，同步补充到 `src/styles/css-vars.scss`。

## 11. 示例：新增组件时的约定

新增 `plt-button` 时：

```txt
src/components/plt-button/
  index.ts
  style.scss
  src/
    button.vue
    button.types.ts
```

`style.scss` 示例：

```scss
.plt-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--plt-basic-row-height);
  padding: 0 var(--plt-space-md);
  color: var(--plt-color-text);
  border-radius: var(--plt-border-radius-base);
}

.plt-button--primary {
  color: #fff;
  background-color: var(--plt-color-primary);
}
```

`components.scss` 追加：

```scss
@use '../components/plt-button/style.scss';
```

## 12. 验收标准

- `src/styles/index.scss` 可作为统一样式入口。
- `src/styles/css-vars.scss` 提供组件库默认 CSS 变量。
- 已有 `plt-loading` 样式可以通过统一样式入口加载。
- 组件样式命名均使用 `plt-` 前缀。
- 主题变量可以通过 `[data-plt-theme='dark']` 或业务侧覆盖生效。
- 新增组件时有明确的样式目录、命名和变量使用规范。

## 13. 后续扩展方向

- 增加 `theme` 模块，提供 `setTheme`、`getTheme` 等运行时 API。
- 增加组件样式按需加载能力。
- 将设计 token 从 JSON 或平台配置生成 CSS 变量。
- 增加 stylelint 规则，限制硬编码颜色和无前缀 class。
- 增加文档站，展示每个组件使用的 token 和可覆盖变量。
