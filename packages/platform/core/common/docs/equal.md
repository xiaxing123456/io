# Equal 数据对比

> 提供深度对比、去空格对比等功能

## 导入

```typescript
import { equalUtils } from '@dmsplatform/common';
// 或
import { isEqual, isEqualTrim } from '@dmsplatform/common';
```

## API

### isEqual

深度对比两个值是否相等（基于 lodash.isEqual）。

```typescript
isEqual(value: any, other: any): boolean
```

**示例：**
```typescript
isEqual({ a: 1 }, { a: 1 }); // true
isEqual([1, 2], [1, 2]);     // true
isEqual({ a: 1 }, { a: 2 }); // false
```

---

### isEqualTrim

去除首尾空格后对比字符串。

```typescript
isEqualTrim(str1: string, str2: string): boolean
```

**示例：**
```typescript
isEqualTrim(' hello ', 'hello'); // true
isEqualTrim('hello', 'world');   // false
```
