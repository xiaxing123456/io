# File 文件工具

> 提供文件类型识别等功能

## 导入

```typescript
import { fileUtils } from '@dmsplatform/common';
// 或
import { getFileType } from '@dmsplatform/common';
```

## API

### getFileType

根据文件后缀获取文件类型。

```typescript
getFileType(fileName: string): string
```

**示例：**
```typescript
getFileType('document.pdf');   // "pdf"
getFileType('image.png');      // "image"
getFileType('data.xlsx');      // "excel"
getFileType('script.js');      // "code"
```
