# Array 数组操作

> 提供数组数据的裁剪、排序、逻辑运算等操作

## 导入

```typescript
import { arrayUtils } from '@dmsplatform/common';
// 或
import { getTrimData, getSortValForOptionIndex, evaluateLogic } from '@dmsplatform/common';
import type { TrimOtions } from '@dmsplatform/common';
```

## API

### getTrimData

根据配置裁剪数据，保留指定字段。

```typescript
getTrimData<T>(data: T | T[], options: TrimOtions): T | T[]
```

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| data | `T \| T[]` | 源数据 |
| options | `TrimOtions` | 裁剪配置 |

**示例：**
```typescript
const data = { id: 1, name: 'test', secret: 'xxx' };
const trimmed = getTrimData(data, { trimKeys: ['id', 'name'] });
// { id: 1, name: 'test' }
```

---

### getSortValForOptionIndex

获取选项的排序值。

```typescript
getSortValForOptionIndex(options: any[], targetIndex: number): number
```

---

### evaluateLogic

逻辑表达式求值，支持 `&&`、`||`、`!` 运算符。

```typescript
evaluateLogic(expression: string, variables: Record<string, boolean>): boolean
```

**示例：**
```typescript
evaluateLogic('A && B', { A: true, B: false });  // false
evaluateLogic('A || B', { A: true, B: false });  // true
evaluateLogic('!A', { A: true });                // false
```
