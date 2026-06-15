import type { PltTreeRowData } from './plt-tree.types';
import { Comment, defineComponent, h, VNode } from 'vue';

/**
 * 在扁平化的 VNode 数组中查找具有特定类名的节点。
 * @param children - VNode 数组
 * @param targetClass - 目标类名
 * @returns 匹配的 VNode 或 undefined
 */
interface DomType {
  type: string;
  props: {
    style?: any;
    class?: string;
  };
  children: any[];
}

/** 创建组件 */
export const createDom = (dom: DomType): any => {
  return defineComponent({
    render() {
      return h(dom.type, dom.props, dom.children);
    },
  });
};

/**
 * 查找符合目标 class 的节点，同时为所有节点生成唯一标识
 * @param children 子节点数组
 * @param targetClass 目标 class 名
 * @returns 符合条件的节点
 */
export const findNodeByClass = (children: VNode[], targetClass: string): VNode | undefined => {
  if (!Array.isArray(children)) {
    return undefined;
  }

  // 为节点生成唯一标识的递归函数
  const generateUniqueId = (node: VNode, parentPath: string, index: number): string => {
    const currentPath = `${parentPath}-${index}`;
    if (!node.props) {
      node.props = {};
    }
    node.props.uniqueId = currentPath; // 存储唯一标识
    return currentPath;
  };

  /**
   * 扁平化并生成唯一标识
   * @param nodes 当前子节点数组
   * @param parentPath 父级路径
   * @returns 扁平化后的节点数组
   */
  const flattenVNodeWithIds = (nodes: VNode[], parentPath = 'root'): VNode[] => {
    return nodes.reduce<VNode[]>((acc, node, index) => {
      const uniqueId = generateUniqueId(node, parentPath, index);

      // 如果当前节点有子节点，递归处理
      if (Array.isArray(node.children)) {
        const flattenedChildren = flattenVNodeWithIds(node.children as VNode[], uniqueId);
        return acc.concat(node, ...flattenedChildren);
      }

      return acc.concat(node);
    }, []);
  };

  // 开始扁平化并生成唯一标识
  const flatChildren = flattenVNodeWithIds(children);

  // 查找符合条件的节点
  return flatChildren.find(child => child?.props?.class?.includes(targetClass));
};

/**
 * 查找节点中的 default 函数
 * @param {VNode[]} children - VNode 子节点数组
 */
export const findDefaultFunction = (children: any): any => {
  if (!children) return undefined;

  if (typeof children?.default === 'function') {
    return children;
  }

  // 确保 children 是数组
  const childArray = Array.isArray(children) ? children : [children];

  // 使用高阶函数处理数组
  return (
    childArray
      .map(child => {
        // 如果当前节点符合条件，直接返回
        if (typeof child.children?.default === 'function') {
          return child.children;
        }

        // 如果有子节点且是数组，递归检查
        if (Array.isArray(child.children)) {
          return findDefaultFunction(child.children);
        }

        return undefined;
      })
      // 去掉未匹配的值
      .filter(Boolean)[0]
  ); // 取第一个非 undefined 的结果
};

/**
 * 转义正则表达式特殊字符
 * @param str
 */
const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * 高亮搜索值并返回新的节点
 * @param targetNode - 目标节点
 * @param searchValue - 搜索值
 * @returns 生成的高亮节点
 */
export const highlightTextInNode = (targetNode: VNode, searchValue: string): VNode | null => {
  if (!targetNode || !searchValue) {
    return null;
  }

  let originalText = '';

  // 确保 targetNode.children 是字符串
  if (Array.isArray(targetNode.children)) {
    originalText = targetNode.children.map(c => (typeof c === 'string' ? c : '')).join('');
  } else if (typeof targetNode.children === 'string') {
    originalText = targetNode.children;
  }

  // 创建正则表达式
  const escaped = escapeRegExp(searchValue);
  const regex = new RegExp(`(${escaped})`, 'ig');

  // 将原始文本分割为高亮部分和非高亮部分
  const parts = originalText?.split?.(regex) || [];

  // 生成高亮后的内容
  const highlightedText = parts.map((part: string, index: number) => {
    return regex.test(part)
      ? h(
          'span',
          {
            class: 'highlight',
            key: `highlight-${index}`,
          },
          part
        )
      : part;
  });

  // 合并原有的 class
  const originalClass = targetNode.props?.class || '';
  const newClass = [originalClass].filter(Boolean).join(' ');

  // 返回新的节点，保留原始结构
  return h('span', { ...targetNode.props, class: newClass }, highlightedText);
};

/**
 * 搜索树结构，命中匹配字段的父节点时，其所有子孙节点全部保留，返回匹配树和所有相关 id。
 * @param tree 原始树结构
 * @param keyword 搜索关键词
 * @param matchKey 用于匹配的字段，默认是 'label'
 */
export const searchTreeWithChildren = (
  tree: PltTreeRowData[],
  keyword: string,
  matchKey = 'label',
  filterNode?: (value: string, data: PltTreeRowData) => boolean
): PltTreeRowData[] => {
  const matchedIds = new Set<string>();

  const filter = (nodes: PltTreeRowData[]): PltTreeRowData[] =>
    nodes.reduce<PltTreeRowData[]>((acc, node) => {
      const isMatched = filterNode
        ? filterNode(keyword, node)
        : String(node[matchKey] ?? '')
            ?.toLowerCase()
            .includes(keyword?.toLowerCase());
      const children = node.children ? filter(node.children) : [];

      if (isMatched) {
        acc.push({ ...node });
      } else if (children.length > 0) {
        matchedIds.add(node.id as string);
        acc.push({ ...node, children });
      }

      return acc;
    }, []);

  return filter(tree);
};

/**
 * 根据唯一标识（uniqueId）在节点树中查找并替换目标节点
 * @param nodes 节点数组
 * @param newNode 替换用的新节点（必须包含 uniqueId）
 * @returns 替换后的节点数组
 */
export const replaceNodeByUniqueId = (nodes: VNode[], newNode: VNode): VNode[] => {
  if (!Array.isArray(nodes)) {
    return nodes;
  }

  // 目标 uniqueId
  const targetId = newNode.props?.uniqueId;
  if (!targetId) {
    console.warn('The newNode does not have a _uniqueId in props.');
    return nodes;
  }

  // 递归处理节点替换
  const replaceNodes = (currentNodes: VNode[]): VNode[] => {
    return currentNodes.map(node => {
      // 如果当前节点的 uniqueId 匹配，则替换为 newNode
      if (node.props?.uniqueId === targetId) {
        return newNode;
      }

      // 如果当前节点有子节点，递归处理
      if (Array.isArray(node.children)) {
        const updatedChildren = replaceNodes(node.children as VNode[]);
        return {
          ...node,
          children: updatedChildren,
        };
      }

      return node; // 不匹配时返回原节点
    });
  };

  return replaceNodes(nodes);
};

/**
 * 替换 vnode 树中 class 含有指定类名的节点
 * @param children 原始 vnode 子节点数组
 * @param className 要匹配的 class 名
 * @param replacerFn 替换函数，接收旧 vnode 返回新 vnode
 */
export const replaceVNodeByClass = (
  children: any[],
  className: string,
  replacerFn: (node: any) => any
): any[] => {
  return children.map(child => {
    if (!child || typeof child !== 'object') return child;

    // const cls = child.props?.class;
    // eslint-disable-next-line no-nested-ternary
    // const classList = Array.isArray(cls) ? cls : typeof cls === 'string' ? cls.split(' ') : [];

    if (typeof child?.children === 'string') {
      /** 包含次类名的内容不处理高亮  not-highlight */
      /** 注释节点不处理 */
      if (child?.props?.class?.includes('not-highlight') || child.type === Comment) {
        return child;
      }
      return replacerFn(child);
    }

    // 递归替换子节点
    if (Array.isArray(child.children)) {
      return {
        ...child,
        children: replaceVNodeByClass(child.children, className, replacerFn),
      };
    }

    return child;
  });
};

/**
 * 公共渲染函数，支持插槽 + 高亮搜索
 * @param params vxe-table 渲染参数
 * @param slots 插槽对象
 * @param label label 字段名
 * @param searchValue 当前搜索关键字
 * @param highlightClassName 高亮类名
 */
export const renderWithHighlight = (
  params: any,
  slots: any,
  label: string,
  searchValue: string,
  highlightClassName: string
) => {
  params.row.label = params.row[label];
  if (slots?.default) {
    const [dom] = slots.default(params);
    const originalDefault = findDefaultFunction(dom.children);

    if (originalDefault && searchValue) {
      // 保存原始 default 函数
      const originalRenderFn = originalDefault.default;

      // 替换 default 函数
      originalDefault.default = (...args: any[]) => {
        // 调用原始渲染逻辑
        const childrenNode = originalRenderFn?.(...args);

        if (!childrenNode) return childrenNode;
        const targetNode = findNodeByClass(
          Array.isArray(childrenNode) ? childrenNode : [childrenNode],
          highlightClassName
        );

        const node = highlightTextInNode(targetNode as any, searchValue);

        return replaceNodeByUniqueId(childrenNode, node as VNode);
      };
    } else if (searchValue) {
      if (typeof dom.children === 'string') {
        dom.children = highlightTextInNode(dom, searchValue);
      } else {
        dom.children = replaceVNodeByClass(dom.children, highlightClassName, targetNode =>
          highlightTextInNode(targetNode, searchValue)
        );
      }
    }
    return createDom(dom).render();
  }

  // 没有插槽，直接返回文本内容
  return params.row[label];
};

/** 格式化树组件data 生成vxe-grid需要的数据格式 */
// export const flattenTree = function (tree: any[], nodeKey = 'id') {
//     const result: any[] = [];

//     function traverse(node: any, parentId: any) {
//         result.push({
//             id: node[nodeKey],
//             parentId,
//             ...node,
//         });

//         if (node.children) {
//             node.children.forEach((child: any) => traverse(child, node.id));
//         }
//     }

//     tree.forEach(node => traverse(node, null));
//     return result;
// };
