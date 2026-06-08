# String 字符串处理

> 提供字符串解析、语言代码转换等功能

## 导入

```typescript
import { stringUtils } from '@dmsplatform/common';
// 或
import { getPathForHash, convertLanguageCode } from '@dmsplatform/common';
```

## API

### getPathForHash

从 URL hash 中提取路径。

```typescript
getPathForHash(hash: string): string
```

**示例：**
```typescript
getPathForHash('#/user/profile?id=1');
// "/user/profile"
```

### convertLanguageCode

将常见的语言代码格式转换为平台统一格式。

```typescript
convertLanguageCode(lang: string): string
```

**支持的语言代码映射：**

| 输入代码 | 输出代码 | 说明 |
|---------|---------|------|
| zh-CN | zh | 简体中文 |
| zh-TW | zh_TW | 繁体中文 |
| en-US | en | 英语(美国) |
| en-GB | en_GB | 英语(英国) |
| ja-JP | ja | 日语 |
| ko-KR | ko | 韩语 |
| fr-FR | fr | 法语 |
| de-DE | de | 德语 |
| es-ES | es | 西班牙语 |
| it-IT | it | 意大利语 |
| pt-PT | pt | 葡萄牙语 |
| ru-RU | ru | 俄语 |

**示例：**
```typescript
convertLanguageCode('zh-CN');
// "zh"

convertLanguageCode('en-US');
// "en"

convertLanguageCode('unknown');
// "unknown" (未匹配时返回原值)
```

**使用场景：**

在 HTTP 请求头中设置语言参数：
```typescript
import { convertLanguageCode } from '@dmsplatform/common';

const headers = {
    'dms-language': convertLanguageCode(locale.value),
};
```
