# Auth 权限校验

> 基于位运算的权限校验工具

## 导入

```typescript
import { authUtils } from '@dmsplatform/common';
// 或
import { hasPltAuth } from '@dmsplatform/common';
```

## API

### hasPltAuth

检查权限值是否包含目标权限位。

```typescript
hasPltAuth(authVal: number, matchVal: number): boolean
```

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| authVal | `number` | 当前权限值 |
| matchVal | `number` | 目标权限位 |

**示例：**
```typescript
// 权限位定义
const READ = 1;    // 0001
const WRITE = 2;   // 0010
const DELETE = 4;  // 0100
const ADMIN = 8;   // 1000

// 用户权限 = READ + WRITE = 3 (0011)
const userAuth = 3;

hasPltAuth(userAuth, READ);   // true
hasPltAuth(userAuth, WRITE);  // true
hasPltAuth(userAuth, DELETE); // false
hasPltAuth(userAuth, ADMIN);  // false
```
