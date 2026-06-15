// 树节点

export type TreeKey = string | number;
export type TreeNodeData = Record<string, any>;
export type TreeData = TreeNodeData[];

/** 树节点配置项 */
export interface ITreeOptionProps {
  /** 子节点的字段名 */
  children?: string;
  /** 标签的字段名 */
  label?: string;
  /** 值的字段名 */
  value?: string;
}

/** 树节点 */
export interface ITreeNode<T = TreeNodeData> {
  /** 节点的唯一标识符 */
  key: TreeKey;
  /** 节点的层级 */
  level: number;
  /** 父节点 */
  parent?: ITreeNode;
  /** 子节点 */
  children?: ITreeNode[];
  /** 节点数据 */
  data: T;
  /** 节点的标签文本 */
  label: string;
  /** 是否为叶子节点 */
  isLeaf?: boolean;
  /** 节点的路径 */
  path?: string;
  /** 节点的宽度 */
  width?: number;
  /** 完整路径 用于e2e测试 */
  fullPath?: string;
  /** 当前节点根节点的key */
  rootId?: TreeKey;
  /** 节点id */
  id?: number;
  /** 解析后的url相关参数，此参数用于匹配路径 */
  parseUrlObj?: Record<string, string>;
}

export interface ITreeInfo {
  /** 节点映射表 */
  treeNodesMap: Map<TreeKey, ITreeNode>;
  /** 所有树节点 */
  treeNodes: ITreeNode[];
  /** 按层级分组的节点映射表 */
  levelNodesMap: Map<TreeKey, ITreeNode[]>;
  /** 最大层级 */
  maxLevel: number;
}
