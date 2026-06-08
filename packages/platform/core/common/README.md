# @dmsplatform/common

> PIMCenter 平台通用工具库 - 零框架依赖的纯函数工具集

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 特性

- **零框架依赖** - 不依赖 Vue/React 等框架，可在任何 JavaScript 环境使用
- **TypeScript 优先** - 完整的类型定义，提供优秀的 IDE 支持
- **Tree Shaking** - 支持按需引入，减少打包体积
- **双模块格式** - 同时提供 ESM 和 CJS 格式

## 安装

```bash
# 项目内部使用（monorepo）
pnpm add @dmsplatform/common

# 或在 package.json 中添加
{
    "dependencies": {
        "@dmsplatform/common": "workspace:*"
    }
}
```

## 快速开始

```typescript
// 方式1：命名空间导入（推荐）
import { treeUtils, arrayUtils, timeUtils } from '@dmsplatform/common';

treeUtils.treeToList(treeData);
arrayUtils.getTrimData(data, options);
timeUtils.convertTimestamp(1000000);

// 方式2：直接导入函数
import { treeToList, hasPltAuth, generateUUID } from '@dmsplatform/common';

// 方式3：导入类型
import type { TrimOtions, TimeTranslations } from '@dmsplatform/common';
```

## 模块概览

| 模块 | 说明 | 文档 |
|------|------|------|
| [auth](#auth) | 权限校验 | [详情](docs/auth.md) |
| [array](#array) | 数组操作 | [详情](docs/array.md) |
| [tree](#tree) | 树形数据处理 | [详情](docs/tree.md) |
| [time](#time) | 时间处理 | [详情](docs/time.md) |
| [storage](#storage) | 本地存储 | [详情](docs/storage.md) |
| [math](#math) | 数学计算 | [详情](docs/math.md) |
| [dom](#dom) | DOM 操作 | [详情](docs/dom.md) |
| [string](#string) | 字符串处理 | [详情](docs/string.md) |
| [file](#file) | 文件工具 | [详情](docs/file.md) |
| [uuid](#uuid) | UUID 生成 | [详情](docs/uuid.md) |
| [equal](#equal) | 数据对比 | [详情](docs/equal.md) |
| [list](#list) | 列表操作 | [详情](docs/list.md) |
| [compose](#compose) | 函数组合 | [详情](docs/compose.md) |
| [path](#path) | 路径解析 | [详情](docs/path.md) |
| [logger](#logger) | 日志工具 | [详情](docs/logger.md) |
| [keyConverter](#keyconverter) | 键名转换 | [详情](docs/key-converter.md) |
| [subscriber](#subscriber) | 订阅者管理 | [详情](docs/subscriber.md) |

---

## API 文档

### auth

权限位运算校验工具。

```typescript
import { hasPltAuth } from '@dmsplatform/common';

// 检查权限值是否包含目标权限
hasPltAuth(15, 4);  // true - 15 包含权限位 4
hasPltAuth(15, 16); // false - 15 不包含权限位 16
```

### array

数组操作工具集。

```typescript
import { getTrimData, getSortValForOptionIndex, evaluateLogic } from '@dmsplatform/common';

// 数据裁剪
const trimmed = getTrimData(data, { trimKeys: ['name', 'value'] });

// 获取排序值
const sortVal = getSortValForOptionIndex(options, targetIndex);

// 逻辑表达式求值
const result = evaluateLogic('A && B', { A: true, B: false }); // false
```

### tree

树形数据处理工具集。

```typescript
import { treeToList, listToTree, getAllParentArr, findTreeToList } from '@dmsplatform/common';

// 树转列表
const list = treeToList(treeData, 'children');

// 列表转树
const tree = listToTree(list, { idKey: 'id', pIdKey: 'parentId', childrenKey: 'children' });

// 查找节点及所有父节点
const parents = getAllParentArr({ list: treeData, key: 'id', keyValue: '123' });

// 模糊搜索树节点
const results = findTreeToList({
    tree: treeData,
    findKey: 'name',
    findValue: '搜索词',
    matchType: FindTreeToListMatchTypeEnum.Fuzzy
});
```

### time

时间处理工具。

```typescript
import { timezoneFormat, convertTimestamp, dayjs } from '@dmsplatform/common';

// 时区转换
timezoneFormat(new Date(), 'Asia/Shanghai', 'YYYY-MM-DD HH:mm:ss');

// 时间差转换（支持国际化）
convertTimestamp(86400000); // "1天 0小时 0分钟"
convertTimestamp(86400000, { day: 'days', hour: 'hours', minute: 'minutes' }); // "1days 0hours 0minutes"
```

### storage

本地存储操作。

```typescript
import { setLocalStorage, getLocalStorage, removeLocalStorage } from '@dmsplatform/common';

// 存储数据
setLocalStorage('user', { name: 'John', age: 30 });

// 读取数据
const user = getLocalStorage('user'); // { name: 'John', age: 30 }

// 删除数据
removeLocalStorage('user');
```

### math

数学计算工具。

```typescript
import { pltMath, mathFormatUtils } from '@dmsplatform/common';

// 双精度浮点数处理
pltMath.numberFormatForDouble(0.1 + 0.2); // 0.3

// 数字格式化
mathFormatUtils.formatFloat(3.14159, 2);  // "3.14"
mathFormatUtils.formatMaxValue(100, 99);  // "99+"
```

### dom

DOM 操作工具。

```typescript
import { createElment, appendElement, getActiveDialogSubBox } from '@dmsplatform/common';

// 创建元素
const div = createElment({ tag: 'div', className: 'container', id: 'app' });

// 追加元素
appendElement(parentEl, childEl);

// 获取活动弹窗容器
const dialogBox = getActiveDialogSubBox();
```

### uuid

UUID 生成器。

```typescript
import { generateUUID } from '@dmsplatform/common';

const id = generateUUID(); // "550e8400-e29b-41d4-a716-446655440000"
```

### equal

数据对比工具。

```typescript
import { isEqual, isEqualTrim } from '@dmsplatform/common';

// 深度对比
isEqual({ a: 1 }, { a: 1 }); // true

// 去空格后对比
isEqualTrim(' hello ', 'hello'); // true
```

### keyConverter

键名格式转换。

```typescript
import { camelToSnake, snakeToCamel, convertTreeDataKeys } from '@dmsplatform/common';

// 驼峰转下划线
camelToSnake('userName'); // "user_name"

// 下划线转驼峰
snakeToCamel('user_name'); // "userName"

// 递归转换树形数据的键名
convertTreeDataKeys(treeData, camelToSnake);
```

### subscriber

订阅者管理器，用于处理并发请求等待队列场景。

```typescript
import { createSubscriberManager } from '@dmsplatform/common';
import type { SubscriberManager } from '@dmsplatform/common';

// 创建订阅者管理器
const subscribers = createSubscriberManager();

// 添加订阅者
subscribers.add(() => {
    console.log('token refreshed');
});

// 通知所有订阅者（执行回调后清空队列）
subscribers.notify();

// 获取当前订阅者数量
const count = subscribers.size();

// 清空队列（不执行回调）
subscribers.clear();
```

---

## 类型定义

```typescript
// 通用对象类型
import type { ObjectOptions } from '@dmsplatform/common';
const obj: ObjectOptions<string> = { key: 'value' };

// 数组裁剪选项
import type { TrimOtions } from '@dmsplatform/common';

// 时间翻译配置
import type { TimeTranslations } from '@dmsplatform/common';

// 树形数据查找选项
import type { GetAllParentArrOpionts } from '@dmsplatform/common';

// 行移动选项
import type { RowMoveOptions } from '@dmsplatform/common';

// DOM 创建选项
import type { CreateElement, CreateElementOptions } from '@dmsplatform/common';

// 函数组合类型
import type { argsFn } from '@dmsplatform/common';

// 订阅者管理器类型
import type { SubscriberManager } from '@dmsplatform/common';
```

---

## 开发

```bash
# 开发模式（监听文件变化）
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

## 目录结构

```
src/
├── index.ts                    # 入口文件
├── types/                      # 全局类型定义
├── utils/
│   ├── auth/                   # 权限校验
│   ├── array/                  # 数组操作
│   ├── tree/                   # 树形数据
│   ├── time/                   # 时间处理
│   ├── storage/                # 本地存储
│   ├── math/                   # 数学计算
│   ├── dom/                    # DOM 操作
│   ├── string/                 # 字符串处理
│   ├── file/                   # 文件工具
│   ├── uuid/                   # UUID 生成
│   ├── equal/                  # 数据对比
│   ├── list/                   # 列表操作
│   ├── compose/                # 函数组合
│   ├── path/                   # 路径解析
│   ├── logger/                 # 日志工具
│   ├── recursive-key-converter/# 键名转换
│   ├── style/                  # 样式配置
│   ├── pure-function/          # 纯函数工具
│   └── subscriber/             # 订阅者管理
└── dependencies/               # 依赖管理
```

## 依赖

| 包名 | 版本 | 说明 |
|------|------|------|
| lodash-es | 4.17.21 | 工具函数库 |
| dayjs | 1.11.10 | 日期处理库 |
| tslib | 2.8.1 | TypeScript 运行时库 |

## 更新日志

### v5.2.1 (2026-02-02)

**新增模块：**
- `subscriber` - 订阅者管理器，用于处理并发请求等待队列场景
- `convertLanguageCode` - 语言代码转换工具，将常见语言代码格式转换为平台统一格式

### v5.2.0 (2026-01-12)

**新增模块：**
- `auth` - 权限位运算校验
- `array` - 数组操作工具集
- `tree` - 树形数据处理
- `time` - 时间处理（支持国际化）
- `storage` - 本地存储操作
- `dom` - DOM 操作工具
- `string` - 字符串处理
- `file` - 文件类型识别
- `uuid` - UUID 生成器
- `equal` - 数据深度对比
- `list` - 列表行操作
- `compose` - 函数组合
- `recursive-key-converter` - 键名格式转换
- `math/format` - 数字格式化

**依赖更新：**
- 新增 `lodash-es` 4.17.21
- 新增 `dayjs` 1.11.10
