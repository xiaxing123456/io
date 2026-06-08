declare global {
  type AnyObj = {
    [key: string]: any;
    [key: number]: any;
  };
  const logger: {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };

  interface Window {
    logger: logger;
    /** 系统代理，挂载到全局，给其他插件使用 */
    DMS_PIMC_PROXY: {
      baseUrl?: string;
      isDev?: boolean;
    };
    spread: GC.Spread.Sheets.Workbook;
    GC: typeof GC;
  }
}

export {};
