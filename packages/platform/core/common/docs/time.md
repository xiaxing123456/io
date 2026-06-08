# Time 时间处理

> 提供时区转换、时间差计算等功能，支持国际化

## 导入

```typescript
import { timeUtils } from '@dmsplatform/common';
// 或
import { timezoneFormat, convertTimestamp, dayjs } from '@dmsplatform/common';
import type { TimeTranslations } from '@dmsplatform/common';
```

## API

### timezoneFormat

时区转换格式化。

```typescript
timezoneFormat(
    date: Date | string | number,
    targetTimezone: string,
    formatType?: string
): string
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| date | `Date \| string \| number` | - | 日期 |
| targetTimezone | `string` | - | 目标时区 |
| formatType | `string` | `'YYYY-MM-DD HH:mm:ss'` | 格式化模板 |

**示例：**
```typescript
timezoneFormat(new Date(), 'Asia/Shanghai');
// "2026-01-12 14:30:00"

timezoneFormat(1704067200000, 'America/New_York', 'MM/DD/YYYY');
// "01/01/2024"
```

---

### convertTimestamp

将毫秒数转换为"天 小时 分钟"格式，支持国际化。

```typescript
convertTimestamp(seconds: number, translations?: TimeTranslations): string
```

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| seconds | `number` | 毫秒数 |
| translations | `TimeTranslations` | 翻译配置（可选） |

**示例：**
```typescript
// 默认中文
convertTimestamp(90061000);
// "1天 1小时 1分钟"

// 自定义翻译（英文）
convertTimestamp(90061000, { day: ' days', hour: ' hours', minute: ' minutes' });
// "1 days 1 hours 1 minutes"
```

---

### dayjs

导出 dayjs 实例，已配置 utc 和 timezone 插件。

```typescript
import { dayjs } from '@dmsplatform/common';

dayjs().format('YYYY-MM-DD');
dayjs().tz('Asia/Tokyo').format();
```
