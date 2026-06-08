# Math 数学计算

> 提供数字格式化、精度处理等功能

## 导入

```typescript
import { pltMath, mathFormatUtils } from '@dmsplatform/common';
// 或
import { formatFloat, formatNumberValFroDigit, formatMaxValue } from '@dmsplatform/common';
```

## API

### numberFormatForDouble

处理 JavaScript 双精度浮点数问题。

```typescript
pltMath.numberFormatForDouble(val: number | string, precision?: number): number
```

**示例：**
```typescript
pltMath.numberFormatForDouble(0.1 + 0.2); // 0.3
```

---

### formatFloat

保留 n 位小数并格式化输出（不足补 0）。

```typescript
formatFloat(value: number | string, digit?: number): string
```

**示例：**
```typescript
formatFloat(3.1, 2);    // "3.10"
formatFloat(3.14159, 2); // "3.14"
```

---

### formatMaxValue

截取数字的最大值显示。

```typescript
formatMaxValue(value: number, maxValue: number): string
```

**示例：**
```typescript
formatMaxValue(100, 99);  // "99+"
formatMaxValue(50, 99);   // "50"
formatMaxValue(0, 99);    // ""
```
