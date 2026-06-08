# List 列表操作

> 提供列表行移动、数据结构处理等功能

## 导入

```typescript
import { listUtils } from '@dmsplatform/common';
// 或
import { objRowMove, dealWithChildren, MoveTypeEnum } from '@dmsplatform/common';
import type { RowMoveOptions } from '@dmsplatform/common';
```

## API

### objRowMove

在数组中移动行（上移/下移）。

```typescript
objRowMove(options: RowMoveOptions): void
```

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| data | `AnyObj[]` | 数据数组 |
| row | `AnyObj` | 要移动的行 |
| type | `'up' \| 'down'` | 移动方向 |
| rowPropKey | `string` | 行标识字段 |

**示例：**
```typescript
const data = [{ id: 1 }, { id: 2 }, { id: 3 }];

objRowMove({ data, row: data[1], type: 'up', rowPropKey: 'id' });
// data = [{ id: 2 }, { id: 1 }, { id: 3 }]
```

---

### dealWithChildren

处理带子节点的数据结构。

```typescript
dealWithChildren(data: any[], childrenKey?: string): any[]
```
