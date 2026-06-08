# DOM 操作

> 提供 DOM 元素创建、操作等功能

## 导入

```typescript
import { domUtils } from '@dmsplatform/common';
// 或
import { createElment, appendElement, getActiveDialogSubBox } from '@dmsplatform/common';
import type { CreateElement, CreateElementOptions } from '@dmsplatform/common';
```

## API

### createElment

创建 DOM 元素。

```typescript
createElment(options: CreateElementOptions): HTMLElement
```

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| options.tag | `string` | 标签名 |
| options.className | `string` | 类名 |
| options.id | `string` | ID |

**示例：**
```typescript
const div = createElment({ tag: 'div', className: 'container', id: 'app' });
```

---

### appendElement

追加子元素到父元素。

```typescript
appendElement(parent: HTMLElement, child: HTMLElement): void
```

---

### getActiveDialogSubBox

获取当前活动弹窗的子容器。

```typescript
getActiveDialogSubBox(): HTMLElement | null
```
