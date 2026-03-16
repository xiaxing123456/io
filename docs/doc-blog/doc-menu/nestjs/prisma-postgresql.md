# Prisma 集成 PostgreSQL

本节介绍在 NestJS 项目中，使用 Prisma ORM 连接 **PostgreSQL** 数据库的完整配置流程。

> 集成前请确保已完成 [Prisma 模块封装](./prisma-nestjs-module)。

## 1. 安装 PostgreSQL 专用依赖

```bash
# 生产依赖：pg 驱动 + Prisma PG 适配器
npm install @prisma/adapter-pg pg

# 开发依赖：pg 类型定义
npm install @types/pg --save-dev
```

| 包名 | 说明 |
| --- | --- |
| `@prisma/adapter-pg` | Prisma 连接 PostgreSQL 的驱动适配器 |
| `pg` | node-postgres 数据库驱动 |
| `@types/pg` | pg 的 TypeScript 类型定义 |

## 2. 初始化 Prisma

```bash
npx prisma init --datasource-provider postgresql
```

生成以下文件：

```
├── prisma/
│   └── schema.prisma
├── prisma.config.ts
└── .env
```

## 3. 配置 .env

```ini
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

参数说明：

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| `username` | PostgreSQL 用户名 | `admin` |
| `password` | PostgreSQL 密码 | `123456` |
| `localhost:5432` | 主机和端口 | `43.138.x.x:5432` |
| `mydb` | 数据库名称 | `pk-db` |

::: tip Docker 快速启动 PostgreSQL
```bash
docker run --name postgres-dev \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres:16
```
:::

## 4. 配置 prisma.config.ts

`prisma init` 自动生成，确认内容如下：

```typescript
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
```

## 5. 配置 schema.prisma

::: warning provider 说明
NestJS 默认是 **CommonJS** 模式，必须使用 `prisma-client-js`。

不要使用 `prisma-client`（ESM 优先生成器），否则 NestJS 启动会报错。
:::

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model users {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  password  String
  name      String?
  type      Int       @default(0)
  status    Int       @default(0)
  email     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## 6. 执行迁移

```bash
# 创建迁移文件并同步到数据库（首次执行）
npx prisma migrate dev --name init

# 生成 Prisma Client（migrate dev 会自动执行）
npx prisma generate
```

## 7. 配置 PrismaService 使用 PG 适配器

在 [Prisma 模块封装](./prisma-nestjs-module) 基础上，PostgreSQL 的 `PrismaService` 使用 `PrismaPg` 适配器：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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

## 8. 接入已有数据库（内省）

如果 PostgreSQL 已有表结构和数据，使用内省功能**反向生成** `schema.prisma`，无需手动建表。

### 两种场景对比

| 场景 | 流程 |
| --- | --- |
| **全新数据库** | 写 `schema.prisma` → `migrate dev` 建表 |
| **已有数据库** | `db pull` 生成 `schema.prisma` → `generate` 生成 Client |

### 执行内省

```bash
# 读取数据库结构，覆写 schema.prisma（原内容会被替换）
npx prisma db pull

# 生成 Prisma Client
npx prisma generate
```

执行后 `schema.prisma` 会自动生成所有已有表的 model：

```prisma
// db pull 自动生成
model users {
  id         Int       @id @default(autoincrement())
  username   String    @unique @db.VarChar(255)
  password   String    @db.VarChar(255)
  created_at DateTime? @default(now()) @db.Timestamptz(6)
}
```

### 设置迁移基线（后续用 migrate 管理变更）

```bash
# 将当前数据库状态标记为已迁移（不执行 SQL，只记录基线）
npx prisma migrate resolve --applied "init"

# 之后正常使用 migrate dev 管理后续变更
npx prisma migrate dev --name add_new_column
```

## 9. 常用命令速查

```bash
# 创建迁移并同步数据库
npx prisma migrate dev --name <迁移名称>

# 内省：已有数据库 → schema.prisma
npx prisma db pull

# 生成 / 更新 Prisma Client
npx prisma generate

# 直接推送 schema 到数据库（不生成迁移文件，适合开发阶段快速迭代）
npx prisma db push

# 可视化管理数据库
npx prisma studio
```
