type AsyncFunction = (...args: any[]) => Promise<any>;

/**
 * 创建一个 AbortController 实例，用于取消任务
 */
export default class UseAbortController {
  public static initAbortController(): AbortController {
    return new AbortController();
  }

  public static withAbort<T extends AsyncFunction>(fn: T, controller: AbortController) {
    // 如果 controller 为空，提示开发者，避免潜在问题
    if (!controller)
      throw new Error('Controller is required but was not provided.[需要控制器，但未提供。');

    const { signal } = controller;

    return function (
      this: ThisParameterType<typeof fn>,
      ...args: Parameters<typeof fn>
    ): ReturnType<typeof fn> {
      // 如果任务已取消，则抛出异常
      if (signal.aborted) throw new DOMException('Task was cancelled[任务已取消]', 'AbortError');

      /** 监听器注册函数 */
      let abortHandler: () => void;
      const abortPromise = new Promise<never>((_, reject) => {
        abortHandler = () => {
          reject(new DOMException('Task was cancelled[任务已取消]', 'AbortError'));
        };
        signal.addEventListener('abort', abortHandler, { once: true });
      });

      const sourcePromise = fn.call(this, ...args, signal);

      // 包装 `fn`，通过 `call` 动态绑定其执行上下文
      return Promise.race([sourcePromise, abortPromise]).finally(() => {
        signal.removeEventListener('abort', abortHandler); // 移除监听器, 防止内存泄露
      }) as ReturnType<typeof fn>;
    };
  }

  public static cancelResource(controller: AbortController | null) {
    if (controller) controller.abort(); // 中止请求
  }
}
