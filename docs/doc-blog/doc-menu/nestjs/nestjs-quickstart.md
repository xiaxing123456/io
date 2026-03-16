# NestJS 快速入门

NestJS 是一个基于 Node.js 的渐进式服务端框架，使用 TypeScript 构建，深度集成了面向对象编程（OOP）和依赖注入（DI）模式。

## 1. 安装 NestJS CLI

```bash
npm install -g @nestjs/cli
```

验证安装：

```bash
nest --version
```

## 2. 创建项目

```bash
nest new my-nestjs-app
```

选择包管理器（`npm` / `pnpm` / `yarn`），等待依赖安装完成。

## 3. 项目目录结构

```
my-nestjs-app/
├── src/
│   ├── app.controller.ts   ← 路由控制器
│   ├── app.module.ts       ← 根模块
│   ├── app.service.ts      ← 业务逻辑
│   └── main.ts             ← 应用入口
├── test/
├── nest-cli.json           ← NestJS CLI 配置
├── tsconfig.json
└── package.json
```

| 文件 | 说明 |
| --- | --- |
| `main.ts` | 应用启动入口，调用 `NestFactory.create()` |
| `app.module.ts` | 根模块，所有模块在此汇总注册 |
| `app.controller.ts` | 处理 HTTP 请求，返回响应 |
| `app.service.ts` | 业务逻辑层，被 Controller 调用 |

## 4. 配置 main.ts

安装 `dotenv`，在入口文件顶部引入，确保环境变量在最早加载：

```bash
npm install dotenv
```

编辑 `src/main.ts`：

```typescript
import 'dotenv/config';  // ← 必须在第一行，最先加载 .env
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## 5. 启动项目

```bash
# 开发模式（热更新）
npm run start:dev

# 生产模式
npm run start:prod
```

访问 `http://localhost:3000`，看到 `Hello World!` 表示项目正常运行。

## 6. NestJS 模块化机制

NestJS 使用**模块（Module）**来组织代码，每个功能块都是一个独立的模块：

```
AppModule（根模块）
├── UserModule（用户模块）
│   ├── UserController
│   └── UserService
├── PrismaModule（数据库模块）
│   └── PrismaService
└── ...
```

### 创建一个模块

```bash
# 快速生成 User 模块（同时生成 controller、service、module）
nest generate module user
nest generate controller user
nest generate service user
```

### 模块注册示例

`src/app.module.ts`：

```typescript
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
})
export class AppModule {}
```

## 7. 常用 CLI 命令

```bash
# 生成模块
nest generate module <name>

# 生成控制器
nest generate controller <name>

# 生成服务
nest generate service <name>

# 构建生产包
npm run build

# 运行测试
npm run test
```
