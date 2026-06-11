import { AjaxConfigOptions, HttpClientHooks, PendingRequest } from './core.types';

const DEFAULT_CANCEL_SCOPE = 'global';

export type RequestCancellationManagerOptions = {
  getHooks: () => HttpClientHooks;
  defaultCancelScope?: string;
};

/** HTTP 请求取消管理器 */
export class RequestCancellationManager {
  /** 待处理请求 */
  private readonly pendingRequests = new Map<symbol, PendingRequest>();
  private readonly pendingRequestIdsByKey = new Map<string, Set<symbol>>();
  private readonly pendingRequestIdsByScope = new Map<string, Set<symbol>>();
  private readonly getHooks: () => HttpClientHooks;
  private readonly defaultCancelScope: string;

  constructor(options: RequestCancellationManagerOptions) {
    this.getHooks = options.getHooks;
    this.defaultCancelScope = options.defaultCancelScope || DEFAULT_CANCEL_SCOPE;
  }

  /** 添加请求到待处理列表 */
  public attachCancellation(config: AjaxConfigOptions) {
    // 获取id
    const requestId = Symbol('http-request');
    const cancelKey = this.resolveCancelKey(config);
    const scopeId = this.resolveCancelScope(config);

    // 判断先前接口是否取消
    const shouldCancelPrevious = !!config.pltConfig?.cancelPrevious;

    if (shouldCancelPrevious) {
      this.cancelRequestsByKey(cancelKey);
    }

    const controller = new AbortController();

    config.signal = controller.signal;
    config.__requestId = requestId;
    config.__cancelKey = cancelKey;
    config.__cancelScope = scopeId;
    this.registerPendingRequest({
      requestId,
      cancelKey,
      scopeId,
      controller,
      cancel: () => {
        if (controller) controller.abort();
      },
      timestamp: Date.now(),
    });
    console.log('attachCancellation', config);
  }

  /** 注册请求 */
  private registerPendingRequest(pendingRequest: PendingRequest) {
    this.pendingRequests.set(pendingRequest.requestId, pendingRequest);

    this.addToIndex(
      this.pendingRequestIdsByKey,
      pendingRequest.cancelKey,
      pendingRequest.requestId
    );
    this.addToIndex(
      this.pendingRequestIdsByScope,
      pendingRequest.scopeId,
      pendingRequest.requestId
    );
  }

  /** 生成请求默认取消 key */
  private generateRequestKey = (config: AjaxConfigOptions): string => {
    return `${config.method?.toUpperCase() || 'GET'}:${config.url || ''}`;
  };

  /** 解析取消请求的key */
  private resolveCancelKey(config: AjaxConfigOptions): string {
    const hooks = this.getHooks();
    return (
      config.pltConfig?.cancelKey ||
      hooks?.getCancelKey?.(config) ||
      this.generateRequestKey(config)
    );
  }

  /** 解析取消请求作用域 */
  private resolveCancelScope(config: AjaxConfigOptions): string {
    const hooks = this.getHooks();

    return (
      config.pltConfig?.cancelScope || hooks.getCancelScope?.(config) || this.defaultCancelScope
    );
  }

  /** 移除请求 */
  public cancelRequestsByKey(cancelKey: string) {
    console.log('cancelRequestsByKey', cancelKey, this.pendingRequestIdsByKey);
    const requestIds = this.pendingRequestIdsByKey.get(cancelKey);
    if (!requestIds) return;

    this.cancelRequestIds(requestIds, `Requests cancelled by key[${cancelKey}]`);
  }

  /** 取消请求 */
  private cancelRequestIds(requestIds: Iterable<symbol>, message: string) {
    [...requestIds].forEach(requestId => {
      const pendingRequest = this.pendingRequests.get(requestId);
      if (!pendingRequest) return;

      pendingRequest.cancel();
      this.pendingRequests.delete(requestId);
      this.removeFromIndex(this.pendingRequestIdsByKey, pendingRequest.cancelKey, requestId);
      this.removeFromIndex(this.pendingRequestIdsByScope, pendingRequest.scopeId, requestId);
    });
    console.warn(message);
  }

  /** 请求完成后移除 pending 请求 */
  public removePendingRequest(config?: AjaxConfigOptions): void {
    const requestId = config?.__requestId;
    if (!requestId) return;
    this.unregisterPendingRequest(requestId);
  }

  private unregisterPendingRequest(requestId: symbol): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) return;
    this.pendingRequests.delete(requestId);
    this.removeFromIndex(this.pendingRequestIdsByKey, pendingRequest.cancelKey, requestId);
    this.removeFromIndex(this.pendingRequestIdsByScope, pendingRequest.scopeId, requestId);
  }

  private addToIndex(index: Map<string, Set<symbol>>, key: string, requestId: symbol): void {
    if (!index.has(key)) {
      index.set(key, new Set());
    }

    index.get(key)?.add(requestId);
  }

  private removeFromIndex(index: Map<string, Set<symbol>>, key: string, requestId: symbol) {
    const values = index.get(key);
    if (!values) return;

    values.delete(requestId);

    if (!values.size) {
      index.delete(key);
    }
  }

  public getPendingCount(scopeId?: string): number {
    if (!scopeId) return this.pendingRequests.size;
    return this.pendingRequestIdsByScope.get(scopeId)?.size ?? 0;
  }

  public getPendingRequests(scopeId?: string): PendingRequest[] {
    if (!scopeId) return [...this.pendingRequests.values()];

    const requestIds = this.pendingRequestIdsByScope.get(scopeId);
    if (!requestIds) return [];

    return [...requestIds]
      .map(requestId => this.pendingRequests.get(requestId))
      .filter((request): request is PendingRequest => !!request);
  }

  public cancelAllRequests(): void {
    this.cancelRequestIds(this.pendingRequests.keys(), 'All requests cancelled[全部请求已取消]');
  }

  public cancelRequestsByScope(scopeId: string): void {
    const requestIds = this.pendingRequestIdsByScope.get(scopeId);
    if (!requestIds) return;

    this.cancelRequestIds(requestIds, `'Requests cancelled by scope[${scopeId}]'`);
  }
}
