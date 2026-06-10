import type { AsyncFunction } from '@admin-vue/composables/use-api/index.types';

import UseAbortController from '@admin-vue/composables/use-abort-controller/UseAbortController';
import UseTaskManager from '@admin-vue/composables/use-task-manager/UseTaskManager';

import { TaskStatus } from '@admin-vue/composables/use-api/index.types';
import { getCurrentRouterQuery, getCurrentRouterUrlFullPath } from '@admin-vue/utils/method/path';

export class UseApiAbortController {
  /** 任务 id */
  private taskId = Symbol();
  private taskrunning = TaskStatus.NotStarted;
  private controller = UseAbortController.initAbortController();
  private recordCancelTask = true;
  private routerFullPath = '';
  private pathId = '';

  constructor(options: { recordCancelTask: boolean }) {
    this.recordCancelTask = options.recordCancelTask;
    const routeQuery = getCurrentRouterQuery();
    this.routerFullPath = getCurrentRouterUrlFullPath();
    this.pathId = routeQuery?.pathId || '';
  }

  /**
   * ### 创建一个带取消功能的函数
   * @param fn
   * @returns
   */
  public withAbortFn<T extends AsyncFunction>(fn: T) {
    return UseAbortController.withAbort(fn, this.controller);
  }

  /**
   * ### 是否应该记录取消任务
   * @returns
   */
  private shouldRecordCancelTask() {
    return this.recordCancelTask;
  }

  /** 注册取消函数 */
  private registerCancelFn(taskId = this.taskId, controller = this.controller) {
    if (!this.shouldRecordCancelTask()) return;

    const cancelFn = () => {
      // 检查任务是否进行中
      if (this.taskId !== taskId || this.taskrunning !== TaskStatus.Running) return;
      // 取消函数
      UseAbortController.cancelResource(controller);
      this.taskrunning = TaskStatus.Cancelled;
    };

    UseTaskManager.registerTask(this.pathId, taskId, cancelFn);
  }

  /** 删除取消任务 */
  private delCancelTask(taskId = this.taskId) {
    if (!this.shouldRecordCancelTask()) return;
    UseTaskManager.delCancelTask(this.pathId, taskId);
  }

  /** 取消当前运行中的任务 */
  private cancelRunningTask() {
    if (this.taskrunning !== TaskStatus.Running) return;

    UseAbortController.cancelResource(this.controller);
    this.delCancelTask();
    this.taskrunning = TaskStatus.Cancelled;
  }

  /** 开始新任务 */
  private startTask() {
    this.delCancelTask();
    this.taskId = Symbol();
    this.controller = UseAbortController.initAbortController();
    this.taskrunning = TaskStatus.Running;
    this.registerCancelFn();

    return this.taskId;
  }

  /** 注册函数取消任务 */
  public registerCancelTask() {
    this.registerCancelFn();
  }

  /** 检查任务当前任务是否可以被取消  */
  public checkCancellation() {
    const curRouterFullPath = getCurrentRouterUrlFullPath();

    // 判断执行任务是否是原路径
    if (this.routerFullPath !== curRouterFullPath) {
      throw new DOMException(
        'Task was cancelled - Is not source Router![任务已取消 - 不是源路由器]',
        'AbortError'
      );
    }

    this.cancelRunningTask();

    return this.startTask();
  }

  /** 重置取消任务状态 */
  public resetCancelTask(taskId = this.taskId) {
    if (this.taskId !== taskId) return;

    this.delCancelTask(taskId);
    this.taskrunning = TaskStatus.Finished;
    this.controller = UseAbortController.initAbortController();
  }
}
