# NestJS CLI 生成命令

NestJS CLI 提供了 `nest generate`（简写 `nest g`）命令，可以快速生成各类代码文件，并自动完成模块注册，大幅提升开发效率。

## 1. 基本语法

```bash
nest generate <schematic> <name> [options]
# 简写
nest g <schematic> <name> [options]
```

| 参数 | 说明 |
| --- | --- |
| `schematic` | 生成的文件类型（如 `module`、`controller`、`service` 等） |
| `name` | 文件名称，支持路径前缀（如 `user/profile`） |
| `options` | 可选参数，控制生成行为 |

---

## 2. 常用生成命令

### 2.1 模块（Module）

```bash
nest g module user
```

生成 `src/user/user.module.ts`，并**自动注册**到父模块（`AppModule`）的 `imports` 中。

```typescript
// src/user/user.module.ts
import { Module } from '@nestjs/common';

@Module({})
export class UserModule {}
```

---

### 2.2 控制器（Controller）

```bash
nest g controller user
```

生成 `src/user/user.controller.ts` 和对应的测试文件，并**自动注册**到 `UserModule` 的 `controllers` 中。

```typescript
// src/user/user.controller.ts
import { Controller } from '@nestjs/common';

@Controller('user')
export class UserController {}
```

---

### 2.3 服务（Service）

```bash
nest g service user
```

生成 `src/user/user.service.ts`，并**自动注册**到 `UserModule` 的 `providers` 中。

```typescript
// src/user/user.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {}
```

---

### 2.4 一键生成完整资源（Resource）

```bash
nest g resource user
```

这是最常用的命令，一次性生成完整的 CRUD 模块，包含：

- `user.module.ts`
- `user.controller.ts`
- `user.service.ts`
- `dto/create-user.dto.ts`
- `dto/update-user.dto.ts`
- `entities/user.entity.ts`
- 各类测试文件

执行后会询问传输协议类型：

```
? What transport layer do you use?
  REST API          ← 生成 HTTP REST 接口
  GraphQL (code first)
  GraphQL (schema first)
  Microservice (non-HTTP)
  WebSockets
```

选择 `REST API` 后还会询问是否生成 CRUD 入口点：

```
? Would you like to generate CRUD entry points? (Y/n)
```

选 `Y` 后生成包含完整增删改查方法的控制器。

---

### 2.5 其他常用类型

| 命令 | 说明 | 生成文件 |
| --- | --- | --- |
| `nest g middleware <name>` | 中间件 | `<name>.middleware.ts` |
| `nest g guard <name>` | 守卫 | `<name>.guard.ts` |
| `nest g interceptor <name>` | 拦截器 | `<name>.interceptor.ts` |
| `nest g pipe <name>` | 管道 | `<name>.pipe.ts` |
| `nest g filter <name>` | 异常过滤器 | `<name>.filter.ts` |
| `nest g decorator <name>` | 自定义装饰器 | `<name>.decorator.ts` |
| `nest g gateway <name>` | WebSocket 网关 | `<name>.gateway.ts` |
| `nest g class <name>` | 普通类 | `<name>.ts` |
| `nest g interface <name>` | 接口 | `<name>.interface.ts` |

---

## 3. 路径与目录控制

### 生成到指定子目录

```bash
# 在 src/user/ 目录下生成 profile 控制器
nest g controller user/profile
```

生成 `src/user/profile/profile.controller.ts`。

### 指定根目录

默认生成到 `src/` 下，可通过 `--sourceRoot` 指定：

```bash
nest g module user --sourceRoot libs
```

---

## 4. 常用选项

| 选项 | 简写 | 说明 |
| --- | --- | --- |
| `--dry-run` | `-d` | 预览将生成的文件，不实际写入 |
| `--no-spec` | | 不生成测试文件（`.spec.ts`） |
| `--flat` | | 不创建子目录，直接生成到当前目录 |
| `--skip-import` | | 跳过自动注册，不修改父模块文件 |

### 预览生成结果

```bash
nest g resource order --dry-run
```

输出示例：

```
CREATE src/order/order.controller.spec.ts
CREATE src/order/order.controller.ts
CREATE src/order/order.module.ts
CREATE src/order/order.service.spec.ts
CREATE src/order/order.service.ts
CREATE src/order/dto/create-order.dto.ts
CREATE src/order/dto/update-order.dto.ts
CREATE src/order/entities/order.entity.ts
UPDATE src/app.module.ts
```

### 不生成测试文件

```bash
nest g resource order --no-spec
```

### 跳过自动注册

```bash
# 只生成文件，不修改 app.module.ts
nest g module order --skip-import
```

---

## 5. 实战示例：快速搭建用户模块

```bash
# 1. 生成完整用户资源
nest g resource user --no-spec

# 2. 选择 REST API，并生成 CRUD 入口点
```

生成后的 `UserController` 已包含完整的增删改查路由：

```typescript
// src/user/user.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
```

---

## 6. 查看全部可用 Schematic

```bash
nest generate --help
```

输出所有可用的生成类型及说明：

```
  app            生成一个新应用（monorepo 模式）
  library        生成一个新库（monorepo 模式）
  class          生成一个类
  controller     生成一个控制器
  decorator      生成一个自定义装饰器
  filter         生成一个过滤器
  gateway        生成一个网关
  guard          生成一个守卫
  interceptor    生成一个拦截器
  interface      生成一个接口
  middleware      生成一个中间件
  module         生成一个模块
  pipe           生成一个管道
  provider       生成一个提供者
  resolver       生成一个 GraphQL 解析器
  resource       生成一个完整资源（CRUD）
  service        生成一个服务
```
