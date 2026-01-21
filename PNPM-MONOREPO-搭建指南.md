# PNPM Monorepo 全栈项目搭建指南

本文档将指导你使用 pnpm workspace 搭建一个包含前端（Vue3 + TS + Vite）、后端（Node.js）、数据库（MySQL）和文档站点（VitePress）的完整 Monorepo 项目。

## 目录结构

```
blog/
├── packages/
│   ├── platform/                 # 前端项目 (Vue3 + TS + Vite)
│   ├── server/              # 后端项目 (Node.js)
│   └── shared/              # 共享代码（类型定义、工具函数等）
├── docs/                    # VitePress 文档
├── pnpm-workspace.yaml      # pnpm workspace 配置
├── package.json             # 根目录 package.json
├── .gitignore
└── README.md
```

---

## 第一步：初始化 Monorepo 项目

### 1.1 确保安装 pnpm

```bash
# 检查 pnpm 版本
pnpm -v

# 如果未安装，使用 npm 安装
npm install -g pnpm
```

### 1.2 初始化根目录

```bash
# 在当前目录（blog）下初始化
pnpm init
```

### 1.3 创建 pnpm-workspace.yaml

在根目录创建 `pnpm-workspace.yaml` 文件：

```yaml
packages:
  - "packages/*"
  - "docs"
```

### 1.4 创建目录结构

```bash
# Windows
mkdir packages\web packages\server packages\shared docs

# Linux/Mac
mkdir -p packages/web packages/server packages/shared docs
```

### 1.5 创建根目录 .gitignore

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.log

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docs cache
docs/.vitepress/cache
docs/.vitepress/dist
```

---

## 第二步：搭建前端项目 (Vue3 + TS + Vite)

### 2.1 创建前端项目

```bash
cd packages/web
pnpm create vite . --template vue-ts
```

**注意**：如果提示目录不为空，先确认目录为空或使用 `--force` 标志。

### 2.2 安装依赖

```bash
pnpm install
```

### 2.3 修改 package.json

确保 `packages/web/package.json` 中的 name 字段为：

```json
{
  "name": "@blog/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 2.4 常用依赖推荐

```bash
# 在 packages/web 目录下

# 路由
pnpm add vue-router

# 状态管理
pnpm add pinia

# HTTP 客户端
pnpm add axios

# UI 组件库（可选）
pnpm add element-plus
# 或
pnpm add ant-design-vue

# 工具库
pnpm add lodash-es
pnpm add -D @types/lodash-es
```

---

## 第三步：搭建后端项目 (Node.js)

### 3.1 初始化后端项目

```bash
cd packages/server
pnpm init
```

### 3.2 修改 package.json

```json
{
  "name": "@blog/server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

### 3.3 创建基本目录结构

```bash
# Windows
mkdir src src\controllers src\routes src\models src\config src\middleware

# Linux/Mac
mkdir -p src/controllers src/routes src/models src/config src/middleware
```

### 3.4 安装核心依赖

```bash
# Express 框架
pnpm add express

# 环境变量管理
pnpm add dotenv

# MySQL 驱动
pnpm add mysql2

# ORM（可选，推荐）
pnpm add sequelize
# 或
pnpm add typeorm

# 开发依赖
pnpm add -D nodemon
```

### 3.5 如果使用 TypeScript（推荐）

```bash
# 安装 TypeScript 相关依赖
pnpm add -D typescript @types/node @types/express ts-node

# 初始化 tsconfig.json
npx tsc --init
```

修改 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

修改 `package.json` scripts：

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 3.6 创建入口文件示例

创建 `src/index.ts` 或 `src/index.js`：

```typescript
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### 3.7 创建 .env 文件

在 `packages/server/` 目录下创建 `.env`：

```env
PORT=3000
NODE_ENV=development

# MySQL 配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog_db
```

---

## 第四步：MySQL 数据库配置

### 4.1 安装 MySQL

根据操作系统安装 MySQL：

- **Windows**: 下载 MySQL Installer
- **Mac**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`

### 4.2 启动 MySQL 服务

```bash
# Windows
net start mysql

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 4.3 创建数据库

```bash
mysql -u root -p
```

在 MySQL 命令行中：

```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4.4 配置数据库连接（使用 Sequelize 示例）

在 `packages/server/src/config/database.ts`：

```typescript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  },
);

export default sequelize;
```

### 4.5 测试数据库连接

在 `src/index.ts` 中添加：

```typescript
import sequelize from "./config/database";

// 测试数据库连接
sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err));
```

---

## 第五步：创建共享包 (Shared)

### 5.1 初始化 shared 包

```bash
cd packages/shared
pnpm init
```

### 5.2 配置 package.json

```json
{
  "name": "@blog/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

### 5.3 创建共享类型定义

创建 `src/types/user.ts`：

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}
```

创建 `src/index.ts`：

```typescript
export * from "./types/user";
// 导出其他共享代码
```

### 5.4 在前端和后端中使用共享包

在 `packages/web/package.json` 和 `packages/server/package.json` 中添加依赖：

```json
{
  "dependencies": {
    "@blog/shared": "workspace:*"
  }
}
```

然后运行：

```bash
# 在根目录
pnpm install
```

在代码中使用：

```typescript
import { User, CreateUserDto } from "@blog/shared";
```

---

## 第六步：搭建 VitePress 文档

### 6.1 初始化 VitePress

```bash
cd docs
pnpm init
```

### 6.2 安装 VitePress

```bash
pnpm add -D vitepress
```

### 6.3 初始化 VitePress 配置

```bash
npx vitepress init
```

按照提示选择：

- 站点标题：Blog Documentation
- 站点描述：Full Stack Blog Project Documentation
- 主题：Default Theme
- 使用 TypeScript：Yes

### 6.4 配置 package.json

```json
{
  "name": "@blog/docs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "docs:dev": "vitepress dev",
    "docs:build": "vitepress build",
    "docs:preview": "vitepress preview"
  }
}
```

### 6.5 创建文档结构

```bash
# Windows
mkdir api guide examples

# Linux/Mac
mkdir -p api guide examples
```

创建 `index.md`：

```markdown
---
layout: home

hero:
  name: Blog Project
  text: Full Stack Development Guide
  tagline: Vue3 + Node.js + MySQL Monorepo Project
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: Vue 3 Frontend
    details: Modern frontend built with Vue 3, TypeScript, and Vite
  - title: Node.js Backend
    details: RESTful API server with Express and MySQL
  - title: Monorepo Structure
    details: Organized with pnpm workspaces for better code sharing
---
```

### 6.6 配置 .vitepress/config.ts

```typescript
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Blog Project",
  description: "Full Stack Blog Documentation",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
      { text: "Examples", link: "/examples/" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Project Structure", link: "/guide/project-structure" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "User API", link: "/api/user" },
            { text: "Post API", link: "/api/post" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/yourusername/blog" },
    ],
  },
});
```

---

## 第七步：配置根目录脚本

### 7.1 修改根目录 package.json

```json
{
  "name": "blog-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --stream dev",
    "dev:web": "pnpm --filter @blog/web dev",
    "dev:server": "pnpm --filter @blog/server dev",
    "dev:docs": "pnpm --filter @blog/docs docs:dev",
    "build": "pnpm -r build",
    "build:web": "pnpm --filter @blog/web build",
    "build:server": "pnpm --filter @blog/server build",
    "build:docs": "pnpm --filter @blog/docs docs:build"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

---

## 第八步：发布文档到 GitHub Pages

### 8.1 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库
2. 在本地初始化 Git：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/blog.git
git push -u origin main
```

### 8.2 配置 VitePress base 路径

修改 `docs/.vitepress/config.ts`：

```typescript
export default defineConfig({
  base: "/blog/", // 仓库名称
  // ... 其他配置
});
```

### 8.3 创建 GitHub Actions 工作流

创建 `.github/workflows/deploy-docs.yml`：

```yaml
name: Deploy Docs

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Build docs
        run: pnpm --filter @blog/docs docs:build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

### 8.4 启用 GitHub Pages

1. 进入仓库的 Settings
2. 点击 Pages
3. Source 选择 `gh-pages` 分支
4. 保存

推送代码后，文档将自动部署到 `https://yourusername.github.io/blog/`

---

## 第九步：启动项目

### 9.1 安装所有依赖

```bash
# 在根目录
pnpm install
```

### 9.2 启动开发服务器

```bash
# 同时启动前端、后端和文档
pnpm dev

# 或分别启动
pnpm dev:web      # 前端：http://localhost:5173
pnpm dev:server   # 后端：http://localhost:3000
pnpm dev:docs     # 文档：http://localhost:5174
```

---

## 第十步：常用命令汇总

```bash
# 安装依赖
pnpm install                              # 安装所有包的依赖
pnpm --filter @blog/web add vue-router    # 为特定包安装依赖

# 开发
pnpm dev                                  # 启动所有服务
pnpm dev:web                              # 只启动前端
pnpm dev:server                           # 只启动后端
pnpm dev:docs                             # 只启动文档

# 构建
pnpm build                                # 构建所有包
pnpm build:web                            # 只构建前端
pnpm build:server                         # 只构建后端
pnpm build:docs                           # 只构建文档

# 清理
pnpm -r clean                             # 清理所有包的构建产物
rm -rf node_modules                       # 删除所有依赖
pnpm install                              # 重新安装
```

---

## 附录：项目最佳实践

### A. 代码规范

安装 ESLint 和 Prettier：

```bash
# 在根目录
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

创建 `.eslintrc.json` 和 `.prettierrc`。

### B. Git Hooks

使用 husky 和 lint-staged：

```bash
pnpm add -D husky lint-staged
npx husky install
```

### C. 环境变量管理

- 创建 `.env.example` 作为模板
- 不要提交 `.env` 文件到 Git
- 在文档中说明必需的环境变量

### D. 数据库迁移

使用 Sequelize CLI 或 TypeORM CLI 管理数据库 schema 变更。

### E. API 文档

考虑使用 Swagger/OpenAPI 自动生成 API 文档。

---

## 总结

现在你已经拥有一个完整的 Monorepo 项目结构！按照本指南操作，你可以：

1. 使用 pnpm workspace 管理多个包
2. 前端使用 Vue3 + TypeScript + Vite 开发
3. 后端使用 Node.js + Express + MySQL
4. 通过 shared 包共享代码
5. 使用 VitePress 编写和发布文档到 GitHub Pages

祝你搭建顺利！如有问题，请参考官方文档或社区资源。
