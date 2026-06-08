# UUID 生成器

> 生成符合 RFC4122 标准的 UUID

## 导入

```typescript
import { uuidUtils } from '@dmsplatform/common';
// 或
import { generateUUID } from '@dmsplatform/common';
```

## API

### generateUUID

生成 UUID v4。

```typescript
generateUUID(): string
```

**示例：**
```typescript
const id = generateUUID();
// "550e8400-e29b-41d4-a716-446655440000"
```
