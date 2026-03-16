# NestJS 集成 SWC 加速编译

SWC（Speedy Web Compiler）是一个用 **Rust** 编写的超高速 JavaScript/TypeScript 编译器，在 NestJS 中替代 `tsc` 后，冷启动和热更新速度可提升 **20 倍以上**。

## SWC vs tsc 对比

| | tsc（默认）| SWC |
| --- | --- | --- |
| 语言 | TypeScript | Rust |
| 编译速度 | 慢（单线程） | 极快（多线程 Rust） |
| 类型检查 | ✅ 有 | ❌ 无（只做转译） |
| 热更新速度 | 一般 | 极快 |
| NestJS 装饰器支持 | 原生支持 | 需要配置 |

::: warning SWC 不做类型检查
SWC 只做**语法转译**，不会检查 TypeScript 类型错误。推荐在 CI/CD 中单独执行 `tsc --noEmit` 做类型检查。
:::

## 涉及依赖

| 包名 | 说明 |
| --- | --- |
| `@swc/core` | SWC 核心库，NestJS CLI 的 SWC builder 依赖它 |
| `@swc/cli` | SWC 命令行工具（可选，用于手动编译） |
| `swc-loader` | Webpack 的 SWC loader，替代 `ts-loader` 做 webpack 构建 |

## 1. 安装依赖

```bash
# NestJS CLI SWC builder 必需
npm install --save-dev @swc/core @swc/cli

# swc-loader（webpack 场景使用）
npm install --save-dev swc-loader
```

完整 devDependencies 参考：

```json
{
  "devDependencies": {
    "@swc/cli": "^0.8.0",
    "@swc/core": "^1.15.18",
    "swc-loader": "^0.2.x",
    "ts-loader": "^9.5.2"
  }
}
```

## 2. 配置方式（两种）

NestJS 集成 SWC 有两种方式，**推荐方式一**：

| 方式 | 说明 | 适合场景 |
| --- | --- | --- |
| **方式一：NestJS CLI Builder**（推荐）| `nest-cli.json` 配置 `"builder": "swc"` | 大多数 NestJS 项目 |
| **方式二：webpack + swc-loader** | 配置 webpack 使用 swc-loader | 需要自定义 webpack 的项目 |

---

## 方式一：NestJS CLI SWC Builder（推荐）

### 2.1 修改 nest-cli.json

在 `nest-cli.json` 中加入 `"builder": "swc"`：

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "builder": "swc"     // ← 核心配置，启用 SWC 编译
  }
}
```

配置后，`nest start`、`nest build`、`nest start --watch` 都会自动使用 SWC 编译。

### 2.2 创建 .swcrc 配置文件

在项目根目录创建 `.swcrc`，配置 NestJS 必须的装饰器支持：

```json
{
  "$schema": "https://json.schemastore.org/swcrc",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,      // 启用装饰器解析
      "dynamicImport": true
    },
    "transform": {
      "legacyDecorator": true,     // NestJS 使用旧版装饰器语法
      "decoratorMetadata": true    // ← 关键！NestJS 依赖注入依赖此选项
    },
    "target": "es2021",
    "keepClassNames": true,        // 保留类名（NestJS DI 需要）
    "baseUrl": "./"
  },
  "module": {
    "type": "nodenext"             // 与 tsconfig.json 的 module 保持一致
  }
}
```

::: danger decoratorMetadata 不可省略
NestJS 的依赖注入（`@Injectable()`、`@Inject()` 等）依赖 `reflect-metadata`，而 `reflect-metadata` 工作需要 `decoratorMetadata: true`。

缺少此配置会导致运行时报错：
```
Nest can't resolve dependencies of the XxxService (?).
Please make sure that the argument at index [0] is available in the XxxModule context.
```
:::

### 2.3 确认 tsconfig.json

SWC builder 会读取 `tsconfig.json` 作为基础配置，确保以下选项存在：

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,    // 必须
    "experimentalDecorators": true,   // 必须
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist"
  }
}
```

### 2.4 启动项目

配置完毕后，直接用原有命令启动，NestJS CLI 会自动调用 SWC：

```bash
# 开发模式（热更新，SWC 加速）
npm run start:dev

# 构建生产包
npm run build

# 生产模式运行
npm run start:prod
```

---

## 方式二：webpack + swc-loader

此方式保留 webpack 作为打包器，仅将 TypeScript 转译部分换成 SWC，适合需要自定义 webpack 配置的场景。

### 自定义 webpack 配置

在项目根目录创建 `webpack.config.js`：

```javascript
module.exports = (options, webpack) => {
  return {
    ...options,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',   // 用 swc-loader 替代 ts-loader
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  decorators: true,
                  dynamicImport: true,
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true,   // 同样必须开启
                },
                target: 'es2021',
                keepClassNames: true,
              },
              module: {
                type: 'commonjs',
              },
              sourceMaps: true,
            },
          },
        },
      ],
    },
    plugins: [
      ...options.plugins,
    ],
  };
};
```

### 在 nest-cli.json 中指定 webpack 配置

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "webpackConfigPath": "webpack.config.js"
  }
}
```

---

## 3. 类型检查（独立执行）

SWC 不做类型检查，建议在 `package.json` 中添加单独的类型检查命令：

```json
{
  "scripts": {
    "start:dev": "cross-env NODE_ENV=development nest start --watch",
    "build": "cross-env NODE_ENV=production nest build",
    "type-check": "tsc --noEmit",
    "build:safe": "npm run type-check && npm run build"
  }
}
```

```bash
# 单独执行类型检查（不生成文件）
npm run type-check

# 先类型检查，再构建
npm run build:safe
```

## 4. 完整项目文件结构

```
my-nestjs-app/
├── .swcrc               ← SWC 编译配置
├── nest-cli.json        ← "builder": "swc"
├── tsconfig.json        ← emitDecoratorMetadata: true
├── webpack.config.js    ← 仅方式二需要
└── package.json
```

## 5. 两种方式对比

| 对比项 | 方式一：CLI Builder | 方式二：swc-loader |
| --- | --- | --- |
| 配置复杂度 | 低（改两个文件） | 中（需写 webpack 配置） |
| 编译速度 | 极快（无 webpack） | 快（webpack + swc 转译）|
| webpack 功能 | 不使用 webpack | 保留 webpack 能力 |
| 推荐程度 | ⭐⭐⭐ 推荐 | 按需使用 |

## 6. 常见问题

### 启动报找不到依赖

```
Nest can't resolve dependencies of the XxxService (?)
```

检查 `.swcrc` 是否设置了 `"decoratorMetadata": true`。

### Windows 下路径问题

`.swcrc` 中的 `baseUrl` 使用正斜杠 `./`，不要用反斜杠。

### 热更新后类型错误没提示

SWC 不做类型检查，这是预期行为。配合编辑器的 TypeScript Language Server（VSCode 默认启用）可以在编辑时看到类型错误。

### module 类型与 tsconfig 不一致

`.swcrc` 的 `module.type` 需要与 `tsconfig.json` 的 `compilerOptions.module` 保持一致：

| tsconfig module | .swcrc module.type |
| --- | --- |
| `nodenext` | `nodenext` |
| `commonjs` | `commonjs` |
| `ESNext` | `es6` |
