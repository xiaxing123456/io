export interface PltSelectProps {
  /**
   * 是否可清空选项
   */
  clearable?: boolean;
  /** 选择框默认文字 */
  placeholder?: string;
  /**
   * 弹出框的样式类名
   */
  popperClass?: string;
  /**
   * 下拉选择单条数据展示的方式
   * @break 换行 default
   * @norm 默认
   */
  optionLineType?: OptionLineType;
  /**
   * 是否为远程搜索
   */
  remote?: boolean;
  /**
   * 是否显示加载中
   */
  loading?: boolean;
  /**
   * 选择数据后是否保持焦点
   */
  isChangeKeepFocus?: boolean;
}

export interface PltSelectEmits {
  visibleChange: [visible: boolean];
  change: [val: string];
}
