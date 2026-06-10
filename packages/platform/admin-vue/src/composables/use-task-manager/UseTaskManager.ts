/** 任务管理器 */
class UseTaskManager {
  private static instance: UseTaskManager | null = null;
  /** 平台任务注册表 */
  public pltTaskRegistry = new Map<string, Map<symbol, () => void>>();

  static getInstance() {
    if (!UseTaskManager.instance) {
      UseTaskManager.instance = new UseTaskManager();
    }
    return UseTaskManager.instance;
  }

  /**
   * 注册任务
   * @param taskMapId taskMapId标识符
   * @param taskId 任务标识符
   * @param cancelFn 取消任务函数
   */
  public registerTask(taskMapId: string, taskId: symbol, cancelFn: () => void) {
    // 创建任务注册表
    if (!this.pltTaskRegistry.has(taskMapId)) {
      this.pltTaskRegistry.set(taskMapId, new Map());
    }
    // 注册任务
    const taskMap = this.pltTaskRegistry.get(taskMapId);
    taskMap?.set(taskId, cancelFn);
  }

  /**
   * 取消某个taskMapId的所有任务
   * @param taskMapId 任务MapID
   * @returns
   */
  public cancelTasks(taskMapId: string) {
    const taskMap = this.pltTaskRegistry.get(taskMapId);
    if (!taskMap) return;
    taskMap.forEach(cancelFn => cancelFn());
    this.pltTaskRegistry.delete(taskMapId); // 清除任务
  }

  /**
   * 取消单个任务
   * @param taskMapId taskMapId标识符
   * @param taskId 任务标识符
   * @returns
   */
  public cancelTask(taskMapId: string, taskId: symbol) {
    const taskMap = this.pltTaskRegistry.get(taskMapId);
    if (!taskMap) return;
    const cancelFn = taskMap.get(taskId);
    if (cancelFn) {
      cancelFn(); // 取消任务
      taskMap.delete(taskId); // 删除任务
    }
  }

  /**
   * 取消所有taskMapId的所有任务
   */
  public cancelAllTasks() {
    this.pltTaskRegistry.forEach((taskMap, taskMapId) => {
      taskMap.forEach(cancelFn => cancelFn());
      this.pltTaskRegistry.delete(taskMapId);
    });
  }

  /**
   * 删除取消任务
   * @param taskMapId
   * @param taskId
   */
  public delCancelTask(taskMapId: string, taskId: symbol) {
    this.pltTaskRegistry.get(taskMapId)?.delete(taskId);
  }
}

export default UseTaskManager.getInstance();
