/**
 * 订阅者管理工具
 * 用于处理并发请求等待队列场景
 *
 * @example
 * ```typescript
 * const subscribers = createSubscriberManager();
 *
 * // 添加订阅者
 * subscribers.add(() => {
 *   console.log('token refreshed');
 * });
 *
 * // 通知所有订阅者
 * subscribers.notify();
 * ```
 */

export interface SubscriberManager<T = void> {
    /** 添加订阅者 */
    add: (callback: () => T) => void;
    /** 通知所有订阅者并清空队列 */
    notify: () => void;
    /** 清空订阅者队列 */
    clear: () => void;
    /** 获取当前订阅者数量 */
    size: () => number;
}

/**
 * 创建订阅者管理器
 * @returns 订阅者管理器实例
 */
export const createSubscriberManager = <T = void>(): SubscriberManager<T> => {
    let subscribers: Array<() => T> = [];

    return {
        add: (callback: () => T) => {
            subscribers.push(callback);
        },
        notify: () => {
            subscribers.forEach(callback => callback());
            subscribers = [];
        },
        clear: () => {
            subscribers = [];
        },
        size: () => subscribers.length,
    };
};
