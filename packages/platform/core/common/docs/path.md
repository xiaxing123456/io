# Path 路径解析

> 提供 URL 路径解析功能

## 导入

```typescript
import { pathUtils } from '@dmsplatform/common';
```

## API

### getPathForHref

从 URL 中提取路径部分。

```typescript
pathUtils.getPathForHref(href: string): string
```

**示例：**
```typescript
pathUtils.getPathForHref('http://example.com/user/profile?id=1');
// "/user/profile"
```

---

### getPathQueryForHref

从 URL 中提取查询参数。

```typescript
pathUtils.getPathQueryForHref(href: string): Record<string, any>
```

**示例：**
```typescript
pathUtils.getPathQueryForHref('http://example.com?id=1&name=test');
// { id: '1', name: 'test' }
```

---

### getUrlFullPath

获取完整的 URL 路径。

```typescript
pathUtils.getUrlFullPath(href: string): string
```
