# 订阅者管理器 (Subscriber Manager)

订阅者管理器是一个用于处理并发请求等待队列的工具。

## 使用场景

在 Token 刷新等场景中，当多个请求同时发现 Token 过期时，我们只需要发起一次刷新请求，其他请求应该等待刷新完成后再继续。订阅者管理器就是用来管理这些等待中的请求。

## API

### createSubscriberManager<T>()

创建一个订阅者管理器实例。

**类型参数**:
- `T` - 订阅者回调函数的返回值类型，默认为 `void`

**返回值**: `SubscriberManager<T>`

```typescript
interface SubscriberManager<T = void> {
    /** 添加订阅者 */
    add: (callback: () => T) => void;
    /** 通知所有订阅者并清空队列 */
    notify: () => void;
    /** 清空订阅者队列 */
    clear: () => void;
    /** 获取当前订阅者数量 */
    size: () => number;
}
```

## 使用示例

### 基础用法

```typescript
import { createSubscriberManager } from '@dmsplatform/common';

// 创建订阅者管理器
const subscribers = createSubscriberManager();

// 添加订阅者
subscribers.add(() => {
    console.log('token refreshed, continue request');
});

// 通知所有订阅者
subscribers.notify();

// 获取订阅者数量
console.log(subscribers.size()); // 0，因为 notify 后队列已清空
```

### Token 刷新场景

```typescript
import { createSubscriberManager } from '@dmsplatform/common';
import type { AxiosInstance } from 'axios';

let isRefreshing = false;
const subscribers = createSubscriberManager<Promise<any>>();

export const handleTokenRefresh = async (
    config: any,
    http: AxiosInstance,
    refreshTokenApi: string
): Promise<any> => {
    if (!isRefreshing) {
        isRefreshing = true;

        try {
            // 刷新 Token
            const newToken = await http.post(refreshTokenApi);
            // 保存新 Token
            saveToken(newToken);

            // 通知所有等待的请求
            subscribers.notify();

            // 重试当前请求
            return http(config);
        } finally {
            isRefreshing = false;
        }
    }

    // 如果正在刷新，将当前请求加入队列
    return new Promise(resolve => {
        subscribers.add(() => {
            resolve(http(config));
        });
    });
};
```

## 方法说明

### add(callback)

添加一个订阅者回调函数到队列中。

**参数**:
- `callback: () => T` - 订阅者回调函数

**示例**:
```typescript
subscribers.add(() => {
    console.log('executed when notified');
});
```

### notify()

通知所有订阅者执行回调，并清空队列。

**示例**:
```typescript
subscribers.notify();
```

### clear()

清空订阅者队列，不执行任何回调。

**示例**:
```typescript
subscribers.clear();
```

### size()

获取当前订阅者队列的长度。

**返回值**: `number`

**示例**:
```typescript
const count = subscribers.size();
console.log(`Current subscribers: ${count}`);
```

## 注意事项

1. `notify()` 方法会在执行完所有回调后自动清空队列
2. 如果需要在不执行回调的情况下清空队列，使用 `clear()` 方法
3. 订阅者回调函数应该是无副作用的纯函数，或者确保多次执行不会产生问题
4. 在并发场景下，建议结合标志位（如 `isRefreshing`）一起使用，避免重复操作

## 相关资源

- 源码位置: `packages/platform-common/src/utils/subscriber/index.ts`
- 使用示例: `packages/platform-http/src/business/http-tools.ts`
