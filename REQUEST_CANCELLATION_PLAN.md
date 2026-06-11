# 请求取消统一方案 V2

> 目标：用户使用 `useApi` 时不需要接收/传递 `signal`，请求取消能力下沉到 `core-http` 统一管理；`useApi` 只负责 UI 状态、防连点、旧结果失效保护。

## 1. 先定边界

如果要求用户这样写：

```ts
const submitLogin = useApi(async () => {
  await formRef.value.validate();
  const { encrypted } = await encrypt(formData.password);
  await login({ userName, password: encrypted });
});
```

并且不允许在 `useApi` 回调参数、业务 API 参数里显式传 `signal`，那么：

- `useApi` **不能可靠地精确知道**回调内部哪一次 axios 请求属于哪一个 `useApi` 执行任务；
- 浏览器环境没有稳定可用的 AsyncLocalStorage，靠全局变量/栈记录“当前 useApi task”在 `await` 并发场景下会串任务；
- 因此不要再让 `useApi` 直接承担“真正中断 HTTP 请求”的职责。

合理方案是：

```text
core-http 负责真正取消 HTTP 请求
useApi 负责用户交互层面的 loading / 防重入 / latest-result guard
路由或页面负责按 scope 批量取消请求
业务 API 只声明自己的取消策略，不需要从 useApi 拿 signal
```

也就是说，取消中心应该从 `packages/platform/admin-vue/src/composables/use-api` 下沉到 `packages/platform/core/http/src/core/http-client.ts`。

## 2. 现有 `http-client.ts` 的关键问题

当前 `http-client.ts` 已经有一套请求取消逻辑：

```ts
const pendingRequests = new Map<string, PendingRequest>();

const addPendingRequest = (config: AjaxConfigOptions) => {
  if (!enableCancelDuplicate || !config.pltConfig?.cancelRequest) return;

  const key = generateRequestKey(config);

  if (pendingRequests.has(key)) {
    pendingRequests.get(key)?.cancel(`Duplicate request cancelled: ${key}`);
    pendingRequests.delete(key);
  }

  const source = Axios.CancelToken.source();
  config.cancelToken = source.token;
  config.cancelKey = key;
  pendingRequests.set(key, { cancel: source.cancel, timestamp: Date.now() });
};
```

这说明项目当前实际取消能力在 HTTP 层，而不是 `useApi` 层。但它有几个不足：

1. `pendingRequests` 用 `method:url` 当唯一 key，不能同时支持：
   - 同 key 取消旧请求；
   - 同页面/同路由批量取消；
   - 同 key 允许并发。
2. `cancelRequest` 名字不准确。现在实际语义是“开启重复请求取消/新请求取消旧请求”。
3. `addPendingRequest(config)` 当前在请求头 hooks 前执行，拿不到后面注入的 `dms-path-id` / `dms-re-path-id`。
4. 只有 `cancelAllRequests()`，没有 `cancelRequestsByScope(scopeId)`。
5. `generateRequestKey` 只包含 `method:url`，不能按业务自定义取消粒度。
6. `useApi` 又额外维护了一套 `AbortController`，和 HTTP 层的 `CancelToken` 没有打通。

## 3. 新架构

### 3.1 分层职责

| 层 | 职责 | 是否真正中断 HTTP |
| --- | --- | --- |
| `core-http/http-client.ts` | 创建取消 token、登记 pending 请求、按 key/scope 取消、识别取消错误 | 是 |
| `admin-vue/request/hooks.ts` | 提供当前请求 scope、取消错误不 toast | 否 |
| `useApi` | loading、重复点击策略、旧结果不覆盖新结果 | 否 |
| router/page | 页面离开时按 scope 批量取消 | 是，调用 HTTP client |

### 3.2 用户侧写法保持简单

推荐使用方式：

```ts
const submitLogin = useApi(
  async () => {
    await formRef.value.validate();

    const { encrypted } = await encrypt(formData.password);

    return login({
      userName: formData.username,
      password: encrypted,
    });
  },
  loginPageRef,
  {
    showLoading: false,
    strategy: 'latest',
  }
).fetchResource;
```

注意：这里没有 `signal`。

业务 API 自己声明取消策略：

```ts
export const login = async (data: AnyObj) => {
  return reqPost(`${envMicrServices.managerServer}/user/login`, qs.stringify(data), {
    pltConfig: {
      cancelRequest: true,
    },
  });
};
```

`cancelRequest: true` 短期继续兼容，后续建议改名为 `cancelPrevious: true`。

## 4. `core-http` 设计

### 4.1 类型调整

建议把 `PltConfig` 调整为：

```ts
export interface PltConfig {
  /** 是否隐藏Toast */
  hideToast?: boolean;

  /**
   * @deprecated 建议使用 cancelPrevious
   * 兼容旧逻辑：新请求开始时取消同 cancelKey 的旧请求
   */
  cancelRequest?: boolean;

  /** 新请求开始时取消同 cancelKey 的旧请求 */
  cancelPrevious?: boolean;

  /** 是否登记到 pending 表，默认 true */
  cancelable?: boolean;

  /** 请求取消分组，不传则由 hooks.getCancelScope 生成 */
  cancelScope?: string;

  /** 请求取消 key，不传则默认 method:url */
  cancelKey?: string;

  /** 是否刷新Token */
  isRefreshToken?: boolean;

  /** 是否返回 AxiosResponse 原始数据 */
  resBaseData?: boolean;
}
```

`AjaxConfigOptions` 里不再把 `cancelKey` 放在顶层，建议改成内部字段：

```ts
export interface AjaxConfigOptions extends AxiosRequestConfig {
  pltConfig?: PltConfig;
  /** 内部字段：真实请求 id */
  __requestId?: symbol;
}
```

`HttpClientHooks` 增加：

```ts
export interface HttpClientHooks {
  getHeaders?: (headers?: Record<string, string>) => Record<string, string>;
  getToken?: () => string | null;
  beforeRequest?: (config: AjaxConfigOptions) => Promise<AjaxConfigOptions> | AjaxConfigOptions;
  afterResponse?: (response: AxiosResponse) => Promise<AxiosResponse> | AxiosResponse;
  onHttpError?: (error: AxiosError, http: AxiosInstance) => Promise<void> | void;

  /** 新增：生成请求取消 scope */
  getCancelScope?: (config: AjaxConfigOptions) => string | undefined;

  /** 新增：生成请求取消 key */
  getCancelKey?: (config: AjaxConfigOptions) => string | undefined;
}
```

`PendingRequest` 调整为：

```ts
export interface PendingRequest {
  requestId: symbol;
  cancelKey: string;
  scopeId: string;
  cancel: (message?: string) => void;
  timestamp: number;
}
```

`HttpClient` 增加：

```ts
export interface HttpClient extends AxiosInstance {
  hooks: HttpClientHooks;
  setHooks: (hooks: Partial<HttpClientHooks>) => void;
  getPendingCount: (scopeId?: string) => number;
  cancelAllRequests: (message?: string) => void;

  /** 新增：按 scope 取消 */
  cancelRequestsByScope: (scopeId: string, message?: string) => void;

  /** 新增：按 cancelKey 取消 */
  cancelRequestsByKey: (cancelKey: string, message?: string) => void;
}
```

### 4.2 pending 表不要只用一个 Map

建议改为三个结构：

```ts
const pendingRequests = new Map<symbol, PendingRequest>();
const pendingRequestIdsByKey = new Map<string, Set<symbol>>();
const pendingRequestIdsByScope = new Map<string, Set<symbol>>();
```

原因：

- 一个真实请求必须有唯一 `requestId`；
- 多个请求可以共享同一个 `scopeId`；
- 多个请求也可以共享同一个 `cancelKey`；
- 是否取消同 key 旧请求，由 `cancelPrevious/cancelRequest` 决定。

### 4.3 请求 key 生成规则

默认：

```ts
const generateRequestKey = (config: AjaxConfigOptions): string => {
  return `${config.method?.toUpperCase() || 'GET'}:${config.url || ''}`;
};
```

优先级：

```text
config.pltConfig.cancelKey
  -> hooks.getCancelKey(config)
  -> 默认 method:url
```

这样兼容当前逻辑，同时允许特殊接口自定义：

```ts
reqGet('/user/list', params, {
  pltConfig: {
    cancelPrevious: true,
    cancelKey: 'user-list',
  },
});
```

### 4.4 scope 生成规则

优先级：

```text
config.pltConfig.cancelScope
  -> hooks.getCancelScope(config)
  -> 'global'
```

在 `admin-vue` 中建议：

```ts
getCancelScope: () => {
  const { pathId } = getCurrentRouterQuery();
  return pathId || getCurrentRouterUrlFullPath() || 'global';
}
```

不要再用空字符串 `''` 作为 scope，否则所有没有 `pathId` 的页面会混到一个分组里。

### 4.5 请求拦截器顺序要调整

当前是先 `addPendingRequest(config)`，再执行 `getHeaders`。

新方案建议顺序：

```text
1. 合并 headers
2. 注入 token
3. 执行 beforeRequest
4. attach cancellation
5. 发起请求
```

原因：`getCancelScope` 可能依赖 headers、route query 或 `beforeRequest` 处理后的 config。

伪代码：

```ts
instance.interceptors.request.use(async (config: AjaxConfigOptions) => {
  if (hooks.getHeaders) {
    config.headers = {
      ...config.headers,
      ...hooks.getHeaders(config.headers),
    };
  }

  if (hooks.getToken) {
    const authorization = hooks.getToken();
    if (authorization) {
      config.headers[tokenHeaderKey] = authorization;
      config.headers.client = 'text';
    }
  }

  const nextConfig = hooks.beforeRequest ? await hooks.beforeRequest(config) : config;

  attachCancellation(nextConfig);

  return nextConfig;
});
```

### 4.6 内部取消实现

为了贴合现有 `http-client.ts`，第一阶段可以继续沿用 `CancelToken`，不强制业务代码传 `signal`。

```ts
const attachCancellation = (config: AjaxConfigOptions) => {
  if (config.pltConfig?.cancelable === false) return;

  const requestId = Symbol('http-request');
  const cancelKey = resolveCancelKey(config);
  const scopeId = resolveCancelScope(config);
  const shouldCancelPrevious = !!(config.pltConfig?.cancelPrevious || config.pltConfig?.cancelRequest);

  if (shouldCancelPrevious) {
    cancelRequestsByKey(cancelKey, `Previous request cancelled: ${cancelKey}`);
  }

  const source = Axios.CancelToken.source();
  config.cancelToken = source.token;
  config.__requestId = requestId;

  registerPendingRequest({
    requestId,
    cancelKey,
    scopeId,
    cancel: source.cancel,
    timestamp: Date.now(),
  });
};
```

后续如果想去掉 `CancelToken`，可以在内部换成 `AbortController`：

```ts
const controller = new AbortController();
config.signal = controller.signal;
cancel: reason => controller.abort(reason);
```

外部 API 不变，用户仍然不需要传 `signal`。

### 4.7 移除 pending

响应成功/失败都根据 `config.__requestId` 删除：

```ts
const removePendingRequest = (config?: AjaxConfigOptions) => {
  const requestId = config?.__requestId;
  if (!requestId) return;

  const pending = pendingRequests.get(requestId);
  if (!pending) return;

  pendingRequests.delete(requestId);
  removeFromIndex(pendingRequestIdsByKey, pending.cancelKey, requestId);
  removeFromIndex(pendingRequestIdsByScope, pending.scopeId, requestId);
};
```

`removeFromIndex` 删除空 Set：

```ts
const removeFromIndex = (index: Map<string, Set<symbol>>, key: string, requestId: symbol) => {
  const ids = index.get(key);
  if (!ids) return;

  ids.delete(requestId);

  if (!ids.size) {
    index.delete(key);
  }
};
```

### 4.8 按 key/scope 取消

```ts
const cancelRequestIds = (requestIds: Iterable<symbol>, message: string) => {
  [...requestIds].forEach(requestId => {
    const pending = pendingRequests.get(requestId);
    if (!pending) return;

    pending.cancel(message);
    unregisterPendingRequest(requestId);
  });
};

instance.cancelRequestsByKey = (cancelKey, message = 'Requests cancelled by key') => {
  const ids = pendingRequestIdsByKey.get(cancelKey);
  if (!ids) return;

  cancelRequestIds(ids, `${message}: ${cancelKey}`);
};

instance.cancelRequestsByScope = (scopeId, message = 'Requests cancelled by scope') => {
  const ids = pendingRequestIdsByScope.get(scopeId);
  if (!ids) return;

  cancelRequestIds(ids, `${message}: ${scopeId}`);
};
```

注意：要先复制 ids 再取消，避免遍历过程中 Map/Set 被修改。

## 5. `admin-vue` request hooks 设计

在 `createPlatformHooks` 中补两个能力：

```ts
export const createPlatformHooks = (config: PlatformHooksConfig): HttpClientHooks => {
  return {
    getHeaders: headers => buildHeaders(headers),
    getToken: () => tokenManager.getAuthorization(),
    getCancelScope: () => {
      const { pathId } = getCurrentRouterQuery();
      return pathId || getCurrentRouterUrlFullPath() || 'global';
    },
    afterResponse: async response => {
      const ajaxConfig = response.config as AjaxConfigOptions;

      if (!response?.data?.success) {
        const msg = response.data?.message;
        if (!ajaxConfig?.pltConfig?.hideToast) ElMessage.error(msg);
        return Promise.reject(response);
      }

      return response;
    },
    onHttpError: async error => {
      if (isRequestCancelled(error)) return;
      // 其他 HTTP 错误处理
    },
  };
};
```

取消错误不应该 toast。

## 6. `useApi` 重新定位

### 6.1 删除 `UseApiAbortController`

`useApi` 不再包 `AbortController`，不再隐式给 sourceFn 塞最后一个 `signal` 参数。

删除/废弃：

```text
packages/platform/admin-vue/src/composables/use-abort-controller/UseAbortController.ts
packages/platform/admin-vue/src/composables/use-api/UseApiAbortController.ts
```

至少不再由 `useApi` 使用它们。

### 6.2 `useApi` 的策略

建议配置：

```ts
export type UseApiStrategy = 'drop' | 'latest' | 'allow';

export type UseApiOptions = {
  showLoading?: boolean;

  /**
   * drop: 运行中再次触发，忽略新触发
   * latest: 允许新触发，旧执行结果失效；HTTP 层负责按 cancelKey 取消旧请求
   * allow: 允许并发，所有结果都正常返回
   */
  strategy?: UseApiStrategy;

  /** @deprecated 用 strategy 替代 */
  debounce?: boolean;

  recordCancelTask?: boolean;
};
```

旧配置兼容：

```text
debounce: true  -> strategy: 'drop'
debounce: false -> strategy: 'latest'
```

### 6.3 `useApi` 用 runId 防止旧结果覆盖新结果

核心逻辑：

```ts
let runSeq = 0;
let activeRunId = 0;
let runningCount = 0;

const fetchResource = async (...args: any[]) => {
  const strategy = resolveStrategy(options);

  if (strategy === 'drop' && runningCount > 0) {
    return Promise.resolve();
  }

  const runId = ++runSeq;
  activeRunId = runId;
  runningCount += 1;
  loading.value = true;

  const loadingIns = showLoading
    ? PltLoading.service({ target: isRef(el) ? el.value : el })
    : null;

  try {
    const data = await sourceFn(...args);

    if (strategy !== 'latest' || activeRunId === runId) {
      result.value = data;
    }

    return data;
  } catch (e) {
    if (!isRequestCancelled(e) && (strategy !== 'latest' || activeRunId === runId)) {
      error.value = e;
    }

    return Promise.reject(e);
  } finally {
    runningCount -= 1;

    const shouldCloseLoading = strategy === 'allow'
      ? runningCount === 0
      : activeRunId === runId;

    if (shouldCloseLoading) {
      loadingIns?.close();
      loading.value = false;
    }
  }
};
```

重点：

- `useApi` 不负责真正 abort HTTP；
- `latest` 策略只保证旧结果不覆盖新结果；
- 真正的 HTTP 取消由 API 的 `pltConfig.cancelRequest/cancelPrevious` 和 `http-client` 完成。

### 6.4 用户写法

登录示例：

```ts
const submitLogin = useApi(
  async () => {
    await formRef.value.validate();

    const { encrypted } = await encrypt(formData.password);

    return login({
      userName: formData.username,
      password: encrypted,
    });
  },
  loginPageRef,
  {
    showLoading: false,
    strategy: 'latest',
  }
).fetchResource;
```

业务 API：

```ts
export const login = async (data: AnyObj) => {
  return reqPost(`${envMicrServices.managerServer}/user/login`, qs.stringify(data), {
    pltConfig: {
      cancelPrevious: true,
      // 兼容期也可以继续写 cancelRequest: true
      // cancelRequest: true,
    },
  });
};
```

用户不需要传 `signal`。

## 7. 页面/路由级取消

页面离开时，需要按 scope 取消所有该页面的 pending 请求。

建议在 router guard 或页面容器里统一做：

```ts
router.beforeEach((to, from) => {
  const scopeId = getRequestScopeByRoute(from);
  http.cancelRequestsByScope(scopeId, 'Route changed');
});
```

关键是 `getRequestScopeByRoute(from)` 和 `hooks.getCancelScope()` 使用同一套规则。

建议封装一个工具：

```ts
export const getRequestScopeFromRoute = (route: RouteLocationNormalizedLoaded) => {
  return route.query?.pathId?.toString() || route.fullPath || 'global';
};
```

运行时 `hooks.getCancelScope()` 也使用同样逻辑，只是数据来源是当前 location/hash。

## 8. 业务 API 迁移规范

每个 API 自己声明取消策略。

### 8.1 表单提交/登录类

同接口只保留最后一次：

```ts
pltConfig: {
  cancelPrevious: true,
}
```

### 8.2 搜索/筛选类

同列表接口只保留最后一次：

```ts
pltConfig: {
  cancelPrevious: true,
  cancelKey: 'project-list',
}
```

### 8.3 互不影响的详情请求

允许并发，但仍登记到当前页面 scope，页面离开时统一取消：

```ts
pltConfig: {
  cancelable: true,
}
```

### 8.4 不希望被统一取消的请求

例如日志上报、埋点：

```ts
pltConfig: {
  cancelable: false,
}
```

## 9. 错误处理

`core-http` 需要统一导出：

```ts
export const isRequestCancelled = (error: unknown): boolean => {
  return (
    Axios.isCancel(error) ||
    (typeof error === 'object' &&
      error !== null &&
      ((error as any).code === 'ERR_CANCELED' ||
        (error as any).name === 'CanceledError' ||
        (error as any).name === 'AbortError'))
  );
};
```

使用原则：

1. `request/hooks.ts` 中取消错误不 toast；
2. `useApi` 中取消错误不写入业务 `error.value`；
3. 页面业务 catch 中如需处理，也先判断 `isRequestCancelled(error)`。

## 10. 迁移步骤

### 第一步：重构 `core-http/http-client.ts`

1. 把 `pendingRequests` 从 `Map<cancelKey, PendingRequest>` 改成：
   - `Map<requestId, PendingRequest>`
   - `Map<cancelKey, Set<requestId>>`
   - `Map<scopeId, Set<requestId>>`
2. 新增 `cancelRequestsByScope` / `cancelRequestsByKey`。
3. 请求拦截器改成：headers/token/beforeRequest 之后再 attach cancellation。
4. 保留 `cancelRequest` 兼容，新增 `cancelPrevious`。
5. 所有 cancelable 请求都登记 pending，而不是只有 `cancelRequest` 请求。

### 第二步：增强类型

修改：

```text
packages/platform/core/http/src/core/core.types.ts
```

增加 `cancelPrevious`、`cancelable`、`cancelScope`、`cancelKey`、`getCancelScope`、`getCancelKey` 等类型。

### 第三步：调整 `admin-vue` hooks

修改：

```text
packages/platform/admin-vue/src/utils/request/common/hooks.ts
```

增加 `getCancelScope`，取消错误不 toast。

### 第四步：重写 `useApi`

修改：

```text
packages/platform/admin-vue/src/composables/use-api/index.ts
```

删除 `UseApiAbortController` 依赖，改为 runId/latest guard。

### 第五步：业务 API 逐步声明取消策略

例如：

```text
packages/platform/admin-vue/src/apis/login/index.ts
```

把：

```ts
pltConfig: { cancelRequest: true }
```

逐步改为：

```ts
pltConfig: { cancelPrevious: true }
```

兼容期可以两个都支持，但新代码只写 `cancelPrevious`。

### 第六步：路由离开统一取消

在 router guard 或页面容器层调用：

```ts
http.cancelRequestsByScope(scopeId, 'Route changed');
```

## 11. 最终效果

完成后应该满足：

1. 用户调用 `useApi` 不需要接收/传递 `signal`。
2. 重复请求取消由 `core-http` 自动完成。
3. 页面离开可以按 route/pathId scope 批量取消所有 pending HTTP 请求。
4. `useApi` 不再维护一套和 HTTP 层不通的 `AbortController`。
5. `latest` 场景下旧请求即使没有被网络层取消，也不会覆盖新结果和 loading。
6. 取消错误不会触发业务 toast。
7. 后续如果要从 `CancelToken` 换成内部 `AbortController`，不影响用户侧和业务 API 写法。
