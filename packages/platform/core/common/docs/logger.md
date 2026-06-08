# Logger 日志工具

> 提供统一的日志输出功能

## 导入

```typescript
import { PltLogger } from '@dmsplatform/common';
```

## API

### generateCustomizeLogger

创建自定义日志实例。

```typescript
PltLogger.generateCustomizeLogger(options?: { useLogger: boolean }): Logger
```

**返回对象：**
- `log` - 普通日志
- `info` - 信息日志
- `warn` - 警告日志
- `error` - 错误日志

**示例：**
```typescript
const logger = PltLogger.generateCustomizeLogger({ useLogger: true });

logger.log('普通日志');
logger.info('信息日志');
logger.warn('警告日志');
logger.error('错误日志');
```
