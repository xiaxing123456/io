/** Token适配器 - 由调用方注入实际的token管理实现 */
export interface TokenAdapter {
  /** 获取完整token信息 */
  getToken: () => string | null;
  /** 设置token信息 */
  setToken: (token: string) => void;
  /** 清除token */
  clearToken?: () => void;
}

/** 平台HTTP配置 */
export interface PlatformHttpConfig {
  baseURL?: string;
  timeout?: number;
  /** Token适配器 - 注入实际的token管理 */
  tokenAdapter?: () => TokenAdapter;
}

/** 错误处理器 - 由调用方实现具体的UI提示和国际化 */
export interface ErrorHandlers {
  /** 无权限时调用 */
  onNoAuth?: () => void;
  /** 登录过期需要确认时调用，返回 Promise 等待用户确认 */
  onLoginExpired?: (message?: string) => Promise<void>;
  /** 服务器错误时调用 */
  onServerError?: (message?: string) => void;
  /** 业务错误时调用（接口返回 success: false） */
  onBusinessError?: (message?: string) => void;
  /** 需要关闭所有弹窗时调用 */
  onCloseAll?: () => void;
}

/** 钩子配置 */
export interface PlatformHooksConfig {
  /** 错误处理器 */
  //   errorHandlers: ErrorHandlers;
  /** 重新登录回调 */
  //   onReLogin: (msg: string, data?: any) => void;
  //   storage: StorageAdapter;
  //   refreshTokenApi?: string;
  /** HTTP实例引用，用于Token刷新后重试 */
  //   getHttp: () => HttpClient;
  /** 日志错误 */
  //   logError?: (error: any) => void;
}
