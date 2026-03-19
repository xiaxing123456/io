# Prisma Data Model 建表指南

本文全面介绍 Prisma Schema 中 **Data Model** 部分的核心概念与使用方式，包括 Models、Fields、Attributes、Enums 以及各类 Relations。

---

## 1. 数据模型概览

Data Model 是 `schema.prisma` 的核心部分，用于描述应用的数据结构。模型（Model）：

- 代表应用领域中的实体（如用户、文章、课程）
- 映射到关系型数据库的**表**（PostgreSQL / MySQL）或 MongoDB 的**集合**
- 作为 Prisma Client 生成 CRUD API 的基础

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  role    Role     @default(USER)
  posts   Post[]
  profile Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}

model Post {
  id        Int        @id @default(autoincrement())
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  title     String
  published Boolean    @default(false)
  author    User       @relation(fields: [authorId], references: [id])
  authorId  Int
}

enum Role {
  USER
  ADMIN
}
```

---

## 2. 定义 Model（模型）

使用 `model` 关键字声明一个模型，模型名采用**单数、PascalCase** 命名规范。

```prisma
model Comment {
  // 字段定义
}

model Tag {
  // 字段定义
}
```

### 映射数据库表名（@@map）

Prisma 推荐模型名使用 PascalCase（如 `User`），而数据库表名通常是 snake_case 复数形式（如 `users`）。使用 `@@map` 可以在不改变数据库表名的情况下自定义模型名：

```prisma
model User {
  id   Int    @id @default(autoincrement())
  name String

  @@map("users")  // 映射到数据库中的 users 表
}
```

这样 Prisma Client 中仍使用 `prisma.user`，但底层操作的是 `users` 表。

---

## 3. 定义 Fields（字段）

字段由以下部分组成：

```
字段名   字段类型   [类型修饰符]   [属性]
id       Int        ?              @id @default(autoincrement())
```

### 3.1 标量类型（Scalar Types）

| Prisma 类型 | 说明 | PostgreSQL 类型 |
| --- | --- | --- |
| `String` | 字符串 | `text` / `varchar` |
| `Int` | 整数 | `integer` |
| `Float` | 浮点数 | `double precision` |
| `Boolean` | 布尔值 | `boolean` |
| `DateTime` | 日期时间 | `timestamp` |
| `Json` | JSON 数据 | `jsonb` |
| `Bytes` | 二进制 | `bytea` |
| `Decimal` | 精确小数 | `decimal` |
| `BigInt` | 大整数 | `bigint` |

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  views     Int      @default(0)
  score     Float?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  meta      Json?
}
```

### 3.2 类型修饰符

| 修饰符 | 说明 |
| --- | --- |
| `?` | 字段可选（允许为 null） |
| `[]` | 字段为列表（数组） |

```prisma
model Post {
  title    String    // 必填
  subtitle String?   // 可选（nullable）
  tags     String[]  // 字符串数组（PostgreSQL 原生支持）
}
```

::: warning 注意
`?` 和 `[]` 不能同时使用，不支持可选列表（`String[]?`）。
:::

### 3.3 原生数据库类型（Native Types）

使用 `@db.` 前缀指定底层数据库的具体类型：

```prisma
model Post {
  id      Int    @id
  title   String @db.VarChar(200)   // 限制 varchar 长度
  content String @db.Text           // 使用 text 类型
  score   Float  @db.DoublePrecision
}
```

原生类型仅在内省（`db pull`）后、底层类型与默认类型不同时自动添加。

### 3.4 不支持的类型（Unsupported）

内省时遇到 Prisma 不支持的数据库类型，会用 `Unsupported` 标记：

```prisma
model Location {
  id       Int                    @id
  position Unsupported("POLYGON")?
}
```

`Unsupported` 字段不会出现在 Prisma Client API 中，但可通过 `$queryRaw` 原始查询访问。

---

## 4. 定义 Attributes（属性）

属性用于修改字段或模型块的行为，分为**字段属性**（`@` 前缀）和**块属性**（`@@` 前缀）。

### 4.1 @id — 主键

每个模型必须有一个唯一标识符。

**单字段主键：**

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}
```

**复合主键（@@id）：**

```prisma
model UserRole {
  userId Int
  roleId Int

  @@id([userId, roleId])
}
```

自定义复合主键名称：

```prisma
model User {
  firstName String
  lastName  String

  @@id(name: "fullName", fields: [firstName, lastName])
}
```

这样在 Prisma Client 中可以用 `fullName` 来查询，而非默认的 `firstName_lastName`。

### 4.2 @default — 默认值

```prisma
model Post {
  id        Int      @id @default(autoincrement())  // 自增整数
  createdAt DateTime @default(now())                // 当前时间
  uuid      String   @default(uuid())               // UUID
  cuid      String   @default(cuid())               // CUID
  published Boolean  @default(false)                // 静态值
  count     Int      @default(0)
  meta      Json     @default("{\"key\": \"value\"}")  // JSON 默认值
}
```

常用默认值函数：

| 函数 | 说明 |
| --- | --- |
| `autoincrement()` | 自增整数（关系型数据库） |
| `now()` | 当前时间戳 |
| `uuid()` | 随机 UUID v4 |
| `cuid()` | 碰撞安全的唯一 ID |
| `auto()` | MongoDB ObjectId |

### 4.3 @unique — 唯一约束

**单字段唯一：**

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique  // email 不可重复
}
```

**复合唯一（@@unique）：**

```prisma
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int

  @@unique([authorId, title])  // 同一作者不能有同名文章
}
```

自定义约束名称：

```prisma
@@unique(name: "authorTitle", fields: [authorId, title])
```

### 4.4 @@index — 索引

为频繁查询的字段添加索引提升性能：

```prisma
model Post {
  id      Int     @id @default(autoincrement())
  title   String
  content String?

  @@index([title])           // 单字段索引
  @@index([title, content])  // 复合索引
}
```

### 4.5 @updatedAt — 自动更新时间

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt  // 每次更新记录时自动设置为当前时间
}
```

### 4.6 @map — 字段映射

将 Prisma 字段名映射到数据库中不同的列名：

```prisma
model User {
  id        Int    @id @default(autoincrement())
  firstName String @map("first_name")  // 数据库列名是 first_name
  lastName  String @map("last_name")   // 数据库列名是 last_name

  @@map("users")
}
```

Prisma Client 中使用 `firstName`，数据库中存的是 `first_name`。

### 4.7 综合示例

结合项目中实际的 `Users` 模型：

```prisma
model Users {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  password  String
  name      String?
  type      Int       @default(0)
  expired   DateTime?
  status    Int       @default(0)
  email     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("users")
}
```

---

## 5. 定义 Enum（枚举）

枚举用于约束字段只能取特定的值（需数据库支持，PostgreSQL / MySQL 均支持）：

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  role  Role    @default(USER)
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

枚举值也可以映射数据库值：

```prisma
enum Status {
  PENDING  @map("pending")
  APPROVED @map("approved")
  REJECTED @map("rejected")

  @@map("post_status")
}
```

::: tip
TypeScript 枚举使用 Schema 中的名称（如 `Status.PENDING`），`@map` 只影响数据库层面的存储值。
:::

---

## 6. Relations（关联关系）

Prisma 中的关系由两部分组成：

- **Relation field（关系字段）**：类型为另一个 Model，仅存在于 Prisma 层，不对应数据库列
- **Relation scalar field（关系标量字段）**：数据库中实际存在的外键列

### 6.1 一对一（1-1）

一个用户只能有一个档案，一个档案只属于一个用户。

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?  // 关系字段（不在数据库中）
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])  // 关系字段
  userId Int    @unique  // 外键（在数据库中），@unique 保证 1-1
}
```

**关键规则：**
- 存放外键的一侧使用 `@relation(fields: [...], references: [...])`
- 外键字段需加 `@unique` 确保一对一
- 没有外键的一侧必须是可选的（`Profile?`）

**也可以把外键放在 User 侧：**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  profile   Profile? @relation(fields: [profileId], references: [id])
  profileId Int?     @unique
}

model Profile {
  id   Int   @id @default(autoincrement())
  bio  String
  user User?
}
```

### 6.2 一对多（1-n）

一个用户可以写多篇文章，每篇文章必须属于一个用户。

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[] // 关系字段，列表表示"多"的一侧
}

model Post {
  id       Int  @id @default(autoincrement())
  title    String
  author   User @relation(fields: [authorId], references: [id])
  authorId Int  // 外键
}
```

**可选的一对多（允许 Post 没有作者）：**

```prisma
model Post {
  id       Int   @id @default(autoincrement())
  title    String
  author   User? @relation(fields: [authorId], references: [id])
  authorId Int?
}
```

结合项目实际示例（课程与用户）：

```prisma
model Users {
  id      Int       @id @default(autoincrement())
  // ...
  courses Courses[] // 一个用户有多门课程

  @@map("users")
}

model Courses {
  id     Int    @id @default(autoincrement())
  author Int
  // ...
  users  Users? @relation(fields: [author], references: [id])

  @@map("courses")
}
```

### 6.3 多对多（m-n）

一篇文章可以属于多个分类，一个分类可以包含多篇文章。

#### 隐式多对多（推荐，无额外字段）

Prisma 自动管理中间表：

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[] // 关系字段
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[] // 关系字段
}
```

Prisma 会在数据库中自动创建 `_CategoryToPost` 中间表（含 `A`、`B` 两列）。

**隐式 m-n 的限制：**
- 两端模型必须各有一个 `@id`（不支持复合主键）
- 不支持在关系上存储额外字段（如关联时间）
- 中间表不出现在 Schema 中

#### 显式多对多（需要额外字段时）

将中间表定义为独立 Model：

```prisma
model Post {
  id         Int                 @id @default(autoincrement())
  title      String
  categories CategoriesOnPosts[]
}

model Category {
  id    Int                 @id @default(autoincrement())
  name  String
  posts CategoriesOnPosts[]
}

model CategoriesOnPosts {
  postId     Int
  categoryId Int
  assignedAt DateTime @default(now()) // 额外字段：关联时间
  assignedBy String                   // 额外字段：操作人

  post     Post     @relation(fields: [postId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@id([postId, categoryId])
}
```

结合项目实际示例（课程与标签）：

```prisma
model Courses {
  id   Int          @id @default(autoincrement())
  tags CourseOnTags[]

  @@map("courses")
}

model CourseTags {
  id      Int            @id @default(autoincrement())
  name    String?
  courses CourseOnTags[]

  @@map("dict_course_tags")
}

// 显式中间表
model CourseOnTags {
  id       Int @id @default(autoincrement())
  courseId Int
  tagId    Int

  course Courses    @relation(fields: [courseId], references: [id])
  tag    CourseTags @relation(fields: [tagId], references: [id])

  @@map("dict_course_on_tags")
}
```

### 6.4 自关联（Self-relations）

模型与自身的关联，常见于树形结构（菜单、评论回复、组织架构）。

**一对多自关联（树形菜单 / 父子评论）：**

```prisma
model Comment {
  id       Int        @id @default(autoincrement())
  content  String
  pid      Int?
  parent   Comment?   @relation("CommentTree", fields: [pid], references: [id])
  children Comment[]  @relation("CommentTree")
}
```

::: tip 命名关系
自关联必须使用 `@relation("名称")` 命名，且两侧名称必须相同。
:::

结合项目实际示例（课程内容树形结构）：

```prisma
model CoursesContens {
  id       Int    @id @default(autoincrement())
  pid      Int
  // ...
  parent   CoursesContens    @relation("CoursesContensRaltion", fields: [pid], references: [id])
  children CoursesContens[]  @relation("CoursesContensRaltion")

  @@map("courses_contens")
}
```

**多对多自关联（用户关注关系）：**

```prisma
model User {
  id         Int     @id @default(autoincrement())
  name       String?
  followedBy User[]  @relation("UserFollows")
  following  User[]  @relation("UserFollows")
}
```

### 6.5 消歧义关系（Disambiguating Relations）

同两个 Model 之间存在多个关系时，需用命名区分：

```prisma
model User {
  id           Int    @id @default(autoincrement())
  writtenPosts Post[] @relation("WrittenPosts")  // 写的文章
  pinnedPost   Post?  @relation("PinnedPost")    // 置顶文章
}

model Post {
  id         Int   @id @default(autoincrement())
  author     User  @relation("WrittenPosts", fields: [authorId], references: [id])
  authorId   Int
  pinnedBy   User? @relation("PinnedPost", fields: [pinnedById], references: [id])
  pinnedById Int?  @unique
}
```

---

## 7. 完整综合示例

以下是一个博客系统的完整 Schema，涵盖所有主要概念：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 枚举：用户角色
enum Role {
  USER
  ADMIN
}

// 枚举：文章状态
enum PostStatus {
  DRAFT    @map("draft")
  PUBLISHED @map("published")
  ARCHIVED @map("archived")

  @@map("post_status")
}

// 用户
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // 1-n：一个用户有多篇文章
  posts   Post[]
  // 1-1：一个用户有一个档案
  profile Profile?

  @@map("users")
}

// 用户档案（1-1）
model Profile {
  id     Int    @id @default(autoincrement())
  bio    String @db.Text
  avatar String?

  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique

  @@map("profiles")
}

// 文章
model Post {
  id        Int        @id @default(autoincrement())
  title     String     @db.VarChar(200)
  content   String?    @db.Text
  status    PostStatus @default(DRAFT)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // 1-n：文章归属用户
  author   User @relation(fields: [authorId], references: [id])
  authorId Int

  // m-n：文章有多个标签
  tags Tag[]

  // 1-n：文章有多个评论
  comments Comment[]

  @@index([authorId])
  @@index([status, createdAt])
  @@map("posts")
}

// 标签（隐式 m-n）
model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]

  @@map("tags")
}

// 评论（自关联：支持回复）
model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())

  // 1-n：评论归属文章
  post   Post @relation(fields: [postId], references: [id])
  postId Int

  // 自关联：父子评论
  pid      Int?
  parent   Comment?  @relation("CommentTree", fields: [pid], references: [id])
  children Comment[] @relation("CommentTree")

  @@map("comments")
}
```

---

## 8. Prisma Client CRUD 速览

每个 Model 在 Prisma Client 中都会生成完整的 CRUD 方法，通过小写模型名访问：

```typescript
// 创建
const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' },
});

// 查询（含关联数据）
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true, profile: true },
});

// 嵌套创建（用户 + 文章）
const userAndPost = await prisma.user.create({
  data: {
    email: 'bob@example.com',
    posts: {
      create: [{ title: '我的第一篇文章' }],
    },
  },
});

// 更新
await prisma.post.update({
  where: { id: 1 },
  data: { status: 'PUBLISHED' },
});

// 删除
await prisma.user.delete({ where: { id: 1 } });

// 批量查询
const posts = await prisma.post.findMany({
  where: { status: 'PUBLISHED' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});
```

| 方法 | 说明 |
| --- | --- |
| `findMany` | 查询多条记录 |
| `findFirst` | 查询第一条匹配记录 |
| `findUnique` | 按唯一字段查询单条 |
| `create` | 创建单条记录 |
| `createMany` | 批量创建 |
| `update` | 更新单条记录 |
| `updateMany` | 批量更新 |
| `upsert` | 存在则更新，不存在则创建 |
| `delete` | 删除单条记录 |
| `deleteMany` | 批量删除 |
| `count` | 计数 |

---

## 9. 常用命令

```bash
# 编写好 schema.prisma 后，创建迁移并同步到数据库
npx prisma migrate dev --name <迁移名称>

# 修改 schema 后重新生成 Prisma Client
npx prisma generate

# 将 schema 直接推送到数据库（开发阶段快速迭代，不生成迁移文件）
npx prisma db push

# 从已有数据库反向生成 schema.prisma（内省）
npx prisma db pull

# 可视化查看/编辑数据库数据
npx prisma studio
```
