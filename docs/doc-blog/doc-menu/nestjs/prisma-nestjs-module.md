# 在 NestJS 中封装 Prisma 模块

本节介绍如何在 NestJS 中将 Prisma 封装成可全局复用的模块，**与具体数据库类型无关**。

> 数据库特定的连接配置（schema、adapter、.env）请参考：
> - [PostgreSQL 集成](./prisma-postgresql)
> - [MySQL 集成](./prisma-mysql)

## 1. 安装基础依赖

```bash
# 生产依赖
npm install @prisma/client dotenv

# 开发依赖（Prisma CLI）
npm install prisma --save-dev
```

## 2. 创建 PrismaService

在 `src/lib/prisma/` 目录下创建 `prisma.service.ts`。

`PrismaService` 继承 `PrismaClient`，在构造函数中传入适配器（adapter）完成数据库连接初始化：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';  // 以 PostgreSQL 为例

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }
}
```

::: tip 为什么不用 OnModuleInit / OnModuleDestroy？
网络上很多旧教程会手动实现生命周期钩子：

```typescript
// 旧写法（不推荐）
async onModuleInit() { await this.$connect(); }
async onModuleDestroy() { await this.$disconnect(); }
```

使用 `@prisma/adapter-pg` 等驱动适配器时，连接池由适配器自动管理，**无需手动调用 `$connect()` / `$disconnect()`**，直接在 `super({ adapter })` 传入即可。
:::

::: info 不同数据库的 adapter 写法
- **PostgreSQL**：`PrismaPg` from `@prisma/adapter-pg` → 见 [PostgreSQL 集成](./prisma-postgresql)
- **MySQL**：无独立 adapter，直接读取 `DATABASE_URL` → 见 [MySQL 集成](./prisma-mysql)
:::

## 3. 创建 PrismaModule

创建 `src/lib/prisma/prisma.module.ts`，加上 `@Global()` 装饰器：

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

::: tip @Global() 的作用
`@Global()` 让 `PrismaModule` 成为全局模块。只需在根模块注册**一次**，整个应用所有模块都可以直接注入 `PrismaService`，不需要每个模块都 `imports: [PrismaModule]`。
:::

## 4. 注册到根模块

编辑 `src/app.module.ts`，只需导入一次：

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './lib/prisma/prisma.module';

@Module({
  imports: [PrismaModule],  // 全局注册，只需在这里写一次
})
export class AppModule {}
```

## 5. 在业务代码中使用

由于是全局模块，任意 Controller 或 Service 直接注入即可，无需额外 import。

### 在 Controller 中使用

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './lib/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  findAllUsers() {
    return this.prisma.users.findMany();
  }
}
```

### 在 Service 中使用（推荐）

将数据库操作放在 Service 层，Controller 只负责接收请求和返回响应：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.users.findMany();
  }

  findOne(id: number) {
    return this.prisma.users.findUnique({ where: { id } });
  }

  create(data: { username: string; password: string; email?: string }) {
    return this.prisma.users.create({ data });
  }

  update(id: number, data: { name?: string; email?: string }) {
    return this.prisma.users.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.users.delete({ where: { id } });
  }
}
```

## 6. 目录结构

```
src/
├── lib/
│   └── prisma/
│       ├── prisma.module.ts   ← @Global() 全局模块
│       └── prisma.service.ts  ← extends PrismaClient
├── user/
│   ├── user.controller.ts     ← 注入 PrismaService（无需 import PrismaModule）
│   ├── user.module.ts
│   └── user.service.ts
├── app.module.ts              ← imports: [PrismaModule]
└── main.ts                    ← 顶部 import 'dotenv/config'
```
