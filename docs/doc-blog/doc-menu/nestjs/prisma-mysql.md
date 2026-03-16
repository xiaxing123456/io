# Prisma 集成 MySQL

本节介绍在 NestJS 项目中，使用 Prisma ORM 连接 **MySQL** 数据库的完整配置流程。

> 集成前请确保已完成 [Prisma 模块封装](./prisma-nestjs-module)。

## 1. 安装 MySQL 专用依赖

MySQL 使用 `mysql2` 驱动，**无需额外的 Prisma adapter 包**：

```bash
npm install mysql2
```

::: tip 与 PostgreSQL 的区别
| | PostgreSQL | MySQL |
| --- | --- | --- |
| 驱动包 | `pg` + `@prisma/adapter-pg` | `mysql2`（无需 adapter） |
| PrismaService 写法 | 需要传入 `PrismaPg` adapter | 直接读取 `DATABASE_URL` |
:::

## 2. 初始化 Prisma

```bash
npx prisma init --datasource-provider mysql
```

## 3. 配置 .env

```ini
DATABASE_URL="mysql://username:password@localhost:3306/mydb"
```

参数说明：

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| `username` | MySQL 用户名 | `root` |
| `password` | MySQL 密码 | `123456` |
| `localhost:3306` | 主机和端口 | `43.138.x.x:3306` |
| `mydb` | 数据库名称 | `my_database` |

::: tip Docker 快速启动 MySQL
```bash
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=mydb \
  -p 3306:3306 \
  -d mysql:8
```
:::

## 4. 配置 prisma.config.ts

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

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model users {
  id        Int       @id @default(autoincrement())
  username  String    @unique @db.VarChar(100)
  password  String    @db.VarChar(255)
  name      String?   @db.VarChar(50)
  type      Int       @default(0)
  status    Int       @default(0)
  email     String?   @db.VarChar(100)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

::: tip MySQL 特有的类型注解
MySQL 的 schema 字段通常需要加 `@db.VarChar(n)` 等原生类型注解来精确控制字段长度，这与 PostgreSQL 略有不同。
:::

## 6. 执行迁移

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 7. 配置 PrismaService（MySQL 写法）

MySQL **不使用** adapter，`PrismaService` 直接继承 `PrismaClient` 即可，连接串自动从 `DATABASE_URL` 读取：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
    // PrismaClient 自动读取 DATABASE_URL 环境变量
    // 无需手动传入 adapter
  }
}
```

与 PostgreSQL 的 `PrismaService` 对比：

```typescript
// ✅ PostgreSQL 写法（使用 adapter-pg）
import { PrismaPg } from '@prisma/adapter-pg';

export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }
}

// ✅ MySQL 写法（无需 adapter）
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
}
```

## 8. 接入已有数据库（内省）

```bash
# 将已有 MySQL 表结构反向生成到 schema.prisma
npx prisma db pull

# 生成 Prisma Client
npx prisma generate
```

内省示例输出：

```prisma
// db pull 自动生成（MySQL）
model users {
  id         Int       @id @default(autoincrement())
  username   String    @unique @db.VarChar(255)
  password   String    @db.VarChar(255)
  created_at DateTime? @default(now()) @db.DateTime(0)
}
```

### 设置迁移基线

```bash
npx prisma migrate resolve --applied "init"
npx prisma migrate dev --name next_change
```

## 9. 常用命令速查

```bash
# 创建迁移并同步数据库
npx prisma migrate dev --name <迁移名称>

# 内省：已有数据库 → schema.prisma
npx prisma db pull

# 生成 / 更新 Prisma Client
npx prisma generate

# 直接推送 schema 到数据库（不生成迁移文件）
npx prisma db push

# 可视化管理数据库
npx prisma studio
```
