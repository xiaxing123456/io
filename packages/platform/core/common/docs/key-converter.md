# Key Converter 键名转换

> 提供驼峰/下划线命名格式转换

## 导入

```typescript
import { keyConverterUtils } from '@dmsplatform/common';
// 或
import { camelToSnake, snakeToCamel, convertTreeDataKeys } from '@dmsplatform/common';
```

## API

### camelToSnake

驼峰命名转下划线命名。

```typescript
camelToSnake(str: string): string
```

**示例：**
```typescript
camelToSnake('userName');     // "user_name"
camelToSnake('getUserInfo');  // "get_user_info"
```

---

### snakeToCamel

下划线命名转驼峰命名。

```typescript
snakeToCamel(str: string): string
```

**示例：**
```typescript
snakeToCamel('user_name');     // "userName"
snakeToCamel('get_user_info'); // "getUserInfo"
```

---

### convertTreeDataKeys

递归转换树形数据的所有键名。

```typescript
convertTreeDataKeys(
    data: Record<string, any> | Record<string, any>[],
    converter: (key: string) => string
): Record<string, any> | Record<string, any>[]
```

**示例：**
```typescript
const data = { userName: 'John', userAge: 30 };
convertTreeDataKeys(data, camelToSnake);
// { user_name: 'John', user_age: 30 }
```
