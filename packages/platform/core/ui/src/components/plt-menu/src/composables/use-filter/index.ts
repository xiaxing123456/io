import type { ITreeInfo, ITreeNode, TreeKey } from '../../type';
import type { TreeProps } from '../use-tree';
import { computed, shallowRef, ShallowRef, triggerRef } from 'vue';

/**
 * 检查值是否为函数
 * @param {unknown} value - 要检查的值
 * @returns {boolean} 返回值是否为函数
 */
const isFunction = (value: unknown): boolean =>
  typeof value === 'function' ||
  value instanceof Function ||
  Object.prototype.toString.call(value) === '[object Function]';

/**
 * 提供树的过滤功能
 * @param {TreeProps} props - 树的属性
 * @param {ShallowRef<ITreeInfo | undefined>} tree - 树的节点信息
 */
export const useFilter = (props: TreeProps, tree: ShallowRef<ITreeInfo | undefined>) => {
  // 存储隐藏节点的 key 集合
  const hiddenNodeKeySet = shallowRef<Set<TreeKey>>(new Set([]));
  // 存储需要强制隐藏展开图标的节点 key 集合
  const hiddenExpandIconKeySet = shallowRef<Set<TreeKey>>(new Set([]));

  // 计算是否具有过滤功能
  const filterable = computed(() => isFunction(props.filterMethod));

  /**
   * 执行过滤操作
   * @param {string} query - 查询字符串
   * @returns {Set<TreeKey> | undefined} 返回展开的节点 key 集合
   */
  const doFilter = (query: string): Set<TreeKey> | undefined => {
    // 如果没有过滤函数，则直接返回
    if (!filterable.value) return undefined;

    const expandKeySet = new Set<TreeKey>(); // 存储需要展开的节点
    const hiddenExpandIconKeys = hiddenExpandIconKeySet.value;
    const hiddenKeys = hiddenNodeKeySet.value;
    const family: ITreeNode[] = []; // 记录遍历路径上的节点
    const nodes = tree.value?.treeNodes || [];
    const filter = props.filterMethod;
    hiddenKeys.clear(); // 清空隐藏节点集合

    /**
     * 递归遍历节点
     * @param {ITreeNode[]} treeNodes - 节点数组
     */
    const traverse = (treeNodes: ITreeNode[]) => {
      treeNodes.forEach(node => {
        family.push(node); // 将当前节点加入家族路径

        // 如果节点匹配过滤条件，所有路径上的节点都需要展开
        if (filter?.(query, node.data)) {
          family.forEach(member => expandKeySet.add(member.key));
        } else if (node.isLeaf) {
          // 叶子节点不匹配时，加入隐藏集合
          hiddenKeys.add(node.key);
        }

        // 如果有子节点，递归遍历
        const { children } = node;
        if (children) traverse(children);

        // 非叶子节点处理展开图标和隐藏逻辑
        if (!node.isLeaf) {
          if (!expandKeySet.has(node.key)) {
            hiddenKeys.add(node.key);
          } else if (children) {
            // 检查所有子节点是否都被隐藏
            const allHidden = children.every(childNode => hiddenKeys.has(childNode.key));
            if (allHidden) {
              hiddenExpandIconKeys.add(node.key); // 隐藏展开图标
            } else {
              hiddenExpandIconKeys.delete(node.key);
            }
          }
        }

        family.pop(); // 回溯，移出当前节点
      });
    };

    traverse(nodes); // 开始遍历
    triggerRef(hiddenNodeKeySet); // 触发响应
    triggerRef(hiddenExpandIconKeySet); // 触发响应

    return expandKeySet; // 返回需要展开的节点 key 集合
  };

  /**
   * 检查节点的展开图标是否需要隐藏
   * @param {ITreeNode} node - 树节点
   * @returns {boolean} 返回是否需要隐藏
   */
  const isForceHiddenExpandIcon = (node: ITreeNode): boolean => {
    return hiddenExpandIconKeySet.value.has(node.key);
  };

  return {
    hiddenExpandIconKeySet,
    hiddenNodeKeySet,
    doFilter,
    isForceHiddenExpandIcon,
  };
};
