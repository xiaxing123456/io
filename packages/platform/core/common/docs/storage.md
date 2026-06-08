# Storage 本地存储

> 封装 localStorage 操作，支持 JSON 序列化

## 导入

```typescript
import { storageUtils } from '@dmsplatform/common';
// 或
import { setLocalStorage, getLocalStorage, removeLocalStorage } from '@dmsplatform/common';
```

## API

### setLocalStorage

存储数据到 localStorage。

```typescript
setLocalStorage(key: string, value: any): void
```

**示例：**
```typescript
setLocalStorage('user', { name: 'John', age: 30 });
setLocalStorage('token', 'abc123');
```

---

### getLocalStorage

从 localStorage 读取数据。

```typescript
getLocalStorage<T = any>(key: string): T | null
```

**示例：**
```typescript
const user = getLocalStorage('user');
// { name: 'John', age: 30 }
```

---

### removeLocalStorage

从 localStorage 删除数据。

```typescript
removeLocalStorage(key: string): void
```
