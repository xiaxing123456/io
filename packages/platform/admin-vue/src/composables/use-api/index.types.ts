import type { LoadingInstance } from '@io-platform/core-ui/src/components/plt-loading';
import type { Ref } from 'vue';

export enum TaskStatus {
  /** 任务未开始 */
  NotStarted = 'NotStarted',
  /** 任务进行中 */
  Running = 'running',
  /** 任务已取消 */
  Cancelled = 'cancelled',
  /** 任务已结束 */
  Finished = 'finished',
}
export type AsyncFunction = (...args: any[]) => Promise<any>;

/** 请求配置参数 */
export type UseApiOptions = {
  /** 是否展示loading */
  showLoading?: boolean;
  /** 是否需要防抖 */
  debounce?: boolean;
  /** 是否记录取消任务 - default: true */
  recordCancelTask?: boolean;
};

/** 请求控制器参数 */
export type UseApiAbortControllerOptions = {
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 加载动画实例 */
  loadingInstance: Ref<LoadingInstance | null>;
  /** 是否记录取消任务 - default: true */
  recordCancelTask: boolean;
};
