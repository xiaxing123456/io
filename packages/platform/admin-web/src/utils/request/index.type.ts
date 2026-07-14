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
  /** 基础URL */
  baseURL?: string;
  /** 请求超时时间 */
  timeout?: number;
}
