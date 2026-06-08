# Compose 函数组合

> 提供函数组合（管道）功能

## 导入

```typescript
import { composeUtils } from '@dmsplatform/common';
// 或
import { compose } from '@dmsplatform/common';
import type { argsFn } from '@dmsplatform/common';
```

## API

### compose

将多个函数组合成一个函数，从右到左执行。

```typescript
compose(...fns: Function[]): Function
```

**示例：**
```typescript
const add10 = (x: number) => x + 10;
const multiply2 = (x: number) => x * 2;

const composed = compose(add10, multiply2);
composed(5); // (5 * 2) + 10 = 20
```
