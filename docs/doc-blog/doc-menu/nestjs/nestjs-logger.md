# NestJS 日志系统（Winston）

本文基于真实项目代码，介绍如何在 NestJS 中集成 **Winston** 日志系统，实现控制台彩色输出 + 按日期自动滚动写入日志文件。

## 涉及依赖

| 包名 | 说明 |
| --- | --- |
| `nest-winston` | Winston 与 NestJS 的官方集成适配器 |
| `winston` | 底层日志库，提供 transport、format 等核心能力 |
| `winston-daily-rotate-file` | 按日期滚动写入日志文件的 transport |
| `cross-env` | 跨平台设置环境变量（Windows/Mac/Linux 统一语法） |

## 1. 安装依赖

```bash
npm install nest-winston winston winston-daily-rotate-file
npm install cross-env --save-dev
```

## 2. 配置 package.json 脚本

使用 `cross-env` 在启动命令中注入 `NODE_ENV`，以区分开发和生产环境的日志行为：

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=development nest start",
    "start:dev": "cross-env NODE_ENV=development nest start --watch",
    "start:debug": "cross-env NODE_ENV=development nest start --debug --watch",
    "build": "cross-env NODE_ENV=production nest build",
    "start:prod": "cross-env NODE_ENV=production node dist/main"
  }
}
```

::: tip cross-env 的作用
Windows 上直接写 `NODE_ENV=production` 会报错，`cross-env` 统一了不同平台的语法。
:::

## 3. 配置 AppModule（注册 WinstonModule）

编辑 `src/app.module.ts`：

```typescript
import { Module } from '@nestjs/common';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// 判断是否为开发环境
const isDebug = process.env.NODE_ENV === 'development';

/**
 * 创建按日期滚动的文件 transport
 * @param level 日志级别（'warn' 只记录警告和错误，'info' 记录所有信息级别）
 * @param filename 日志文件名前缀（生成文件如 error-2025-01-01.log）
 */
const createDailyRotateTransport = (level: string, filename: string) => {
  return new DailyRotateFile({
    level,
    dirname: 'logs',                        // 日志文件存放目录
    filename: `${filename}-%DATE%.log`,     // 文件名格式
    datePattern: 'YYYY-MM-DD',             // 按天滚动
    zippedArchive: true,                    // 旧日志自动 gzip 压缩
    maxSize: '20m',                         // 单个文件最大 20MB
    maxFiles: '14d',                        // 保留最近 14 天
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple(),
    ),
  });
};

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'silly',  // 捕获所有级别（silly > debug > verbose > info > warn > error）
      transports: [
        // Transport 1：控制台输出（带颜色，NestJS 风格）
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
              colors: true,       // 彩色输出
              prettyPrint: true,  // 格式化打印
            }),
          ),
        }),

        // Transport 2：文件输出（仅生产环境）
        ...(isDebug
          ? []  // 开发环境：不写文件，只输出到控制台
          : [
              createDailyRotateTransport('warn', 'error'),  // 错误日志：logs/error-YYYY-MM-DD.log
              createDailyRotateTransport('info', 'app'),    // 应用日志：logs/app-YYYY-MM-DD.log
            ]),
      ],
    }),
  ],
})
export class AppModule {}
```

### 日志级别说明

Winston 的日志级别从高到低：

| 级别 | 数值 | 说明 |
| --- | --- | --- |
| `error` | 0 | 错误，需要立即处理 |
| `warn` | 1 | 警告，潜在问题 |
| `info` | 2 | 普通信息 |
| `verbose` | 3 | 详细信息 |
| `debug` | 4 | 调试信息 |
| `silly` | 5 | 最详细（全捕获） |

> 设置 `level: 'silly'` 表示捕获所有级别。
> 文件 transport 设置 `level: 'warn'` 表示只记录 warn 和 error 级别到该文件。

## 4. 在 main.ts 中替换 NestJS 默认日志

编辑 `src/main.ts`，让 NestJS 框架本身（启动日志、异常日志等）也走 Winston：

```typescript
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 替换 NestJS 默认 Logger，让框架日志也走 Winston
  app.useLogger(app.get(WINSTON_MODULE_PROVIDER));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

## 5. 在业务代码中使用 Logger

通过 `@Inject(WINSTON_MODULE_PROVIDER)` 注入 Winston Logger 实例。

### 在 Controller 中使用

```typescript
import { Controller, Get, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Controller()
export class AppController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  getHello(): string {
    this.logger.info('收到 GET / 请求');
    return 'Hello World!';
  }
}
```

### 在 Service 中使用

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  findAll() {
    this.logger.info('查询所有用户');
    // ...
  }

  create(data: any) {
    this.logger.info('创建用户', { data });
    try {
      // ...
    } catch (e) {
      this.logger.error('创建用户失败', { error: e });
      throw e;
    }
  }
}
```

### 日志方法一览

```typescript
this.logger.error('错误信息', { error });      // 错误
this.logger.warn('警告信息');                   // 警告
this.logger.info('普通信息', { key: 'value' }); // 信息（支持附带对象）
this.logger.verbose('详细信息');                // 详细
this.logger.debug('调试信息');                  // 调试
```

## 6. DailyRotateFile 参数说明

```typescript
new DailyRotateFile({
  level: 'info',               // 该 transport 处理的最低日志级别
  dirname: 'logs',             // 日志文件目录（相对于项目根目录）
  filename: 'app-%DATE%.log',  // %DATE% 会被替换为实际日期
  datePattern: 'YYYY-MM-DD',   // 按天滚动（也可 'YYYY-MM-DD-HH' 按小时）
  zippedArchive: true,         // 旧文件自动 gzip 压缩，节省空间
  maxSize: '20m',              // 单文件超过 20MB 强制滚动
  maxFiles: '14d',             // 只保留最近 14 天的日志（加 'd' 后缀表示天数）
})
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `dirname` | string | 日志存放目录 |
| `filename` | string | 文件名，`%DATE%` 是日期占位符 |
| `datePattern` | string | 日期格式，决定滚动频率 |
| `zippedArchive` | boolean | 是否 gzip 压缩归档文件 |
| `maxSize` | string | 单文件最大大小（`'20m'`、`'1g'`） |
| `maxFiles` | string/number | 保留文件数量或天数（`'14d'`、`30`） |

## 7. 生成的日志文件结构

```
logs/
├── app-2025-01-01.log          ← 当天应用日志
├── app-2025-01-01.log.gz       ← 过期日志（自动压缩）
├── app-2025-01-02.log.gz
├── error-2025-01-01.log        ← 当天错误日志
└── error-2025-01-01.log.gz
```

::: tip 建议将 logs/ 加入 .gitignore
```
logs
*.log
```
:::

## 8. 开发 vs 生产日志行为对比

| 行为 | 开发环境（`NODE_ENV=development`）| 生产环境（`NODE_ENV=production`）|
| --- | --- | --- |
| 控制台输出 | ✅ 带颜色，NestJS 风格 | ✅ 带颜色，NestJS 风格 |
| 写入文件 | ❌ 不写文件 | ✅ 按天写入 error/app 日志文件 |
| 错误日志 | 仅控制台 | 控制台 + `logs/error-*.log` |
| 应用日志 | 仅控制台 | 控制台 + `logs/app-*.log` |
