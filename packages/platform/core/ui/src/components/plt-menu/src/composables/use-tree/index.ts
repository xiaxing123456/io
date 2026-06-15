import { treeToList } from '@io-platform/core-common';
import PltVirtuallyList from '../../../../plt-virtually-list/plt-virtually-list';
import type {
  ITreeInfo,
  ITreeNode,
  ITreeOptionProps,
  TreeData,
  TreeKey,
  TreeNodeData,
} from '../../type';
import { useFilter } from '../use-filter';
import { useEventListener } from '@vueuse/core';
import { debounce } from 'lodash-es';
import {
  computed,
  ExtractPropTypes,
  nextTick,
  onBeforeUnmount,
  PropType,
  ref,
  SetupContext,
  shallowRef,
  triggerRef,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';

// enums
export enum TreeOptionsEnum {
  KEY = 'id',
  LABEL = 'label',
  CHILDREN = 'children',
}

// emits
export const NODE_CLICK = 'node-click';
export const NODE_EXPAND = 'node-expand';
export const NODE_COLLAPSE = 'node-collapse';
export const CURRENT_CHANGE = 'current-change';
export const TREE_SCROLL = 'scroll';

export const TreeEmits = {
  [NODE_CLICK]: (data: TreeNodeData, node: ITreeNode, e: MouseEvent) => data && node && e,
  [NODE_EXPAND]: (data: TreeNodeData, node: ITreeNode) => data && node,
  [NODE_COLLAPSE]: (data: TreeNodeData, node: ITreeNode) => data && node,
  [CURRENT_CHANGE]: (data: TreeNodeData, node: ITreeNode) => data && node,
  [TREE_SCROLL]: (e: Event) => e,
};

export const treeProps = {
  /** 所有数据 */
  data: {
    type: Object as PropType<TreeData>,
    required: true,
    default: () => [],
  },
  /** 配置选项 */
  fieldNames: {
    type: Object as PropType<ITreeOptionProps>,
    default: () => ({ children: 'children', label: 'label', value: 'value' }),
  },
  /** 默认展开节点 */
  defaultExpandedKeys: {
    type: Array as PropType<TreeKey[]>,
    default: () => [],
  },
  /** 相邻级节点间的水平缩进，单位为像素 */
  indent: {
    type: Number,
    default: 16,
  },
  /** 元素最小高度 */
  minSize: {
    type: Number,
    default: 10,
  },
  /** 是否在点击节点的时候展开或者收缩节点 */
  expandOnClickNode: {
    type: Boolean,
    default: true,
  },
  /** 对树节点进行筛选时执行的方法， 返回 false 则表示这个节点会被隐藏 */
  filterMethod: {
    type: Function as PropType<(query: string, node: TreeNodeData) => boolean>,
  },
  /** 是否水平折叠收起菜单 */
  collapse: {
    type: Boolean,
    default: false,
  },
  /** 页面加载时默认激活菜单的 index */
  defaultActive: {
    type: String,
    default: '',
  },
  /** 是否启用vue-router 模式
   *  启用该模式会在激活导航时以 节点数据中的path字段 作为 path 进行路由跳转 使用 default-active 来设置加载时的激活项。
   */
  router: {
    type: Boolean,
    default: false,
  },
  /** 搜索关键字 */
  keyword: {
    type: String,
    default: '',
  },
};

export type TreeProps = ExtractPropTypes<typeof treeProps>;

export const useTree = (props: TreeProps, emits: SetupContext<typeof TreeEmits>['emit']) => {
  /** 用于引用虚拟列表组件实例的引用，初始值为 null */
  const virListRef = ref<InstanceType<typeof PltVirtuallyList> | null>(null);
  /** 存储已展开节点键的集合，使用 shallowRef 以优化性能 */
  /** 初始值为 props.defaultExpandedKeys 中的节点键集合 */
  const expandedKeysSet = shallowRef<Set<TreeKey>>(new Set(props.defaultExpandedKeys));

  /**
   * 忽略的路径参数进行匹配
   */
  const ignoreParams = ['customParameters', 'noticeId'];

  /** 用于存储树的整体结构信息，类型为 ITreeInfo，可以为 undefined */
  const tree = shallowRef<ITreeInfo | undefined>();
  /** 当前选中的节点键 */
  const currentNode = ref<TreeKey>('');
  /** 存储父节点键的集合，用于快速查找和操作父节点 */
  const parentNodeKeys = new Set<TreeKey>();

  /** 记录折叠前的展开节点，用于折叠后的展开 */
  // const expandNodeCollapseKey = ref<Set<TreeKey>>();
  /** 折叠后的级联菜单位置相关数据 */
  const position = ref();
  /** 折叠后悬浮元素子级数据 */
  const options = ref();
  /** 折叠后悬浮显示内容 */
  const isShowCollapseContent = ref();
  /** 存储级联菜单的定时器 */
  const timeout = ref<number>();
  /** 当前悬浮节点 */
  const currentHoverNode = ref<ITreeNode>();

  const { doFilter, hiddenNodeKeySet, isForceHiddenExpandIcon } = useFilter(props, tree);
  const router = useRouter();

  const valueKey = computed(() => {
    return props.fieldNames?.value || TreeOptionsEnum.KEY;
  });
  const childrenKey = computed(() => {
    return props.fieldNames?.children || TreeOptionsEnum.CHILDREN;
  });
  const labelKey = computed(() => {
    return props.fieldNames?.label || TreeOptionsEnum.LABEL;
  });

  /** 扁平化树数据 */
  const flattenTree = computed(() => treeToList(tree.value?.treeNodes || [], childrenKey.value));

  const getKey = (node: TreeNodeData): TreeKey => (node ? node[valueKey.value] : '');
  const getChildren = (node: TreeNodeData): TreeNodeData[] => (node ? node[childrenKey.value] : []);
  const getLabel = (node: TreeNodeData): string => (node ? node[labelKey.value] : '');

  /**
   * 清除指定查询参数的路径
   *
   * @param {string} path - 需要清理的路径
   * @param {string[]} ignoreParam - 要忽略的查询参数名称数组
   *
   * @example
   * // 假设当前路径为 "/some/path?param1=123&customParameters=abc"
   * const cleanedPath = cleanPath("/some/path?param1=123&customParameters=abc", ["customParameters"]);
   * console.log(cleanedPath); // 输出: "/some/path?param1=123"
   */
  const cleanPath = (path: string, ignoreParam: string[] = ignoreParams) => {
    const [baseUrl, queryString] = path.split('?');
    if (!queryString) return baseUrl;

    const params = new URLSearchParams(queryString);

    // 遍历并删除需要忽略的查询参数
    ignoreParam.forEach(param => params.delete(param));

    // [...params.entries()].forEach(([key, value]) => {
    //     // 如果参数值为空，则删除该参数
    //     if (!value) params.delete(key);
    // });
    return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  /**
   * 递归展开当前节点的所有父节点。
   *
   * @param {ITreeNode} node - 当前要展开的树节点。
   */
  const expandParents = (node: ITreeNode) => {
    // 将当前节点的 key 添加到已展开的节点集合中
    expandedKeysSet.value.add(node.key);

    // 如果当前节点没有父节点，终止递归
    if (!node.parent) return;

    // 递归展开父节点
    expandParents(node.parent);
  };

  /**
   * 计算并返回展平后的树节点列表，包含根据展开状态和隐藏状态筛选的节点。
   *
   * 1. 遍历树节点，根据 `expandedKeysSet` 决定是否递归遍历子节点。
   * 2. 根据 `hiddenNodeKeySet` 过滤出非隐藏节点。
   *
   * @returns {ITreeNode[]} 展平后的树节点列表。
   */
  const flattenList = computed(() => {
    const expandedKeys = expandedKeysSet.value; // 获取已展开的节点键集合
    const hiddenNodeKeys = hiddenNodeKeySet.value; // 获取隐藏的节点键集合
    const flattenNodes: ITreeNode[] = []; // 用于存储展平后的节点列表
    const nodes = tree.value?.treeNodes || []; // 获取根节点列表

    /**
     * 遍历树节点，按展开和隐藏状态对节点进行处理。
     *
     * @param {ITreeNode} node - 当前遍历的树节点。
     */
    const traverse = (node: ITreeNode) => {
      // 过滤掉隐藏的节点
      if (!hiddenNodeKeys.has(node.key)) {
        flattenNodes.push(node);
      }

      // 如果节点已展开，继续遍历其子节点
      if (expandedKeys.has(node.key)) {
        node.children?.forEach((child: ITreeNode) => traverse(child));
      }
    };

    // 对根节点进行遍历
    nodes.forEach(traverse);
    // 每次需要调用virList的更新（因为可能出现length不变和数据直接被更新的情况）
    virListRef.value?.forceUpdate();
    // 返回展平后的节点列表
    return flattenNodes;
  });

  /**
   * 解析 URL 和所有查询参数
   * @param {string} fullUrl 完整的 URL 字符串
   * @returns 格式化后的对象，包含 URL 和所有查询参数
   */
  const parseUrl = (fullUrl: string) => {
    // 创建一个 URL 对象来方便解析
    const urlObj = new URL(fullUrl, window.location.origin);

    // 获取路径部分（不带查询字符串）
    const urlPath = urlObj.pathname;

    // 获取查询参数，并将其转换为对象
    const queryParams = new URLSearchParams(urlObj.search);

    // 将查询参数转换为一个对象
    const params: Record<string, string> = {};
    queryParams.forEach((value, key) => {
      params[key] = value;
    });

    // 返回包含路径和所有查询参数的对象
    return { url: urlPath, ...params };
  };

  /**
   * 创建树的内部表示结构，包括节点映射、层级节点映射及最大层级。
   *
   * @param {TreeData} data - 树数据，包含所有的节点信息。
   * @returns {ITreeInfo} 包含树的结构信息，包括树节点数组、节点映射、层级节点映射和最大层级。
   */
  const createTree = (data: TreeData): ITreeInfo => {
    // 存储节点的映射关系，键为节点的唯一标识
    const treeNodesMap = new Map<TreeKey, ITreeNode>();
    // 存储每个层级的节点数组
    const levelNodesMap = new Map<number, ITreeNode[]>();

    let maxLevel = 1; // 初始化最大层级为 1

    /**
     * 递归遍历树节点，构建树的内部数据。
     *
     * * @param nodes - 当前层级的节点数据。
     * * @param level - 当前节点的层级。默认为 `1`。
     * * @param parent - 当前节点的父节点。默认为 `undefined`，表示根节点没有父节点。
     * * @returns 返回展平后的节点列表。
     */
    const flat = (
      nodes: TreeData,
      level = 1,
      parent?: ITreeNode,
      rootId?: TreeKey
    ): ITreeNode[] => {
      const currNodes: ITreeNode[] = [];

      nodes?.forEach(rawNode => {
        const children = getChildren(rawNode);
        const key = getKey(rawNode);
        const label = getLabel(rawNode);

        // 拼接父节点的 label，生成当前节点的完整路径
        const parentLabelPath = parent ? parent.fullPath || getLabel(parent) : '';
        const fullPath = parentLabelPath ? `${parentLabelPath}/${label}` : label;
        // 确定根节点 ID，如果没有父节点，则当前节点为根节点
        const currentRootId = rootId ?? key;
        const parseUrlObj = parseUrl(rawNode.path);

        const node: ITreeNode = {
          ...rawNode,
          key,
          parent,
          level,
          label,
          isLeaf: !children || children.length === 0,
          data: rawNode,
          fullPath,
          rootId: currentRootId, // 绑定根节点 ID
          parseUrlObj,
        };

        if (children && children.length) {
          node.children = flat(children, level + 1, node, currentRootId);
        }
        parentNodeKeys.add(node.key);
        currNodes.push(node);
        treeNodesMap.set(key, node);
        if (level > maxLevel) {
          maxLevel = level;
        }
        const levelInfo = levelNodesMap.get(level);
        if (levelInfo) {
          levelInfo.push(node);
        } else {
          levelNodesMap.set(level, [node]);
        }
      });
      return currNodes;
    };
    const treeNodes = flat(data);
    return {
      treeNodes,
      treeNodesMap,
      levelNodesMap,
      maxLevel,
    };
  };

  /**
   * 展开指定的树节点
   * @param {ITreeNode} node - 需要展开的树节点
   */
  const expandNode = (node: ITreeNode): void => {
    emits(NODE_EXPAND, node.data, node);
    expandedKeysSet.value.add(node.key);
    triggerRef(expandedKeysSet);
  };

  /**
   * 折叠指定的树节点
   * @param {ITreeNode} node - 需要折叠的树节点
   */
  const collapseNode = (node: ITreeNode): void => {
    emits(NODE_COLLAPSE, node.data, node);
    expandedKeysSet.value.delete(node.key);
    triggerRef(expandedKeysSet);
  };

  /**
   * 切换指定树节点的展开或折叠状态
   * @param {ITreeNode} node - 需要切换的树节点
   */
  const toggleExpand = async (node: ITreeNode) => {
    if (!virListRef.value) return; // 如果虚拟列表不存在，则直接返回

    const { offset: preOffset } = virListRef.value.reactiveData; // 获取当前滚动偏移量

    const isExpanded = expandedKeysSet.value.has(node.key); // 检查节点是否已展开
    if (isExpanded) {
      collapseNode(node); // 如果已展开，则折叠节点
    } else {
      expandNode(node); // 如果未展开，则展开节点
    }

    // 在 DOM 更新完成后恢复滚动位置
    await nextTick();
    virListRef.value.scrollToOffset(preOffset);
  };

  /**
   * 设置树的数据
   * @param {TreeData} data - 新的树数据
   */
  const setTreeData = (data: TreeData): void => {
    tree.value = createTree(data);
  };

  /**
   * 找到指定节点的根节点
   * @param node - 需要查找根节点的树节点
   */
  const findRootNode = (node: ITreeNode): ITreeNode => {
    let current = node;
    while (current.parent) {
      current = current.parent;
    }
    return current;
  };

  /**
   * 检查指定节点是否已展开
   * @param {ITreeNode} node - 需要检查的树节点
   * @returns {boolean} - 如果节点已展开返回 true，否则返回 false
   */
  const isExpanded = (node: ITreeNode): boolean => {
    return expandedKeysSet.value.has(node.key);
  };

  /**
   * 检查指定节点是否是当前选中的节点
   * @param {ITreeNode} node - 需要检查的树节点
   * @returns {boolean} - 如果是当前节点返回 true，否则返回 false
   */
  const isCurrent = (node: ITreeNode): boolean => {
    return currentNode.value === node.key;
  };

  /**
   * 当点击树节点时触发的事件处理函数
   * @param {ITreeNode} node - 被点击的树节点
   * @param {MouseEvent} e - 鼠标点击事件对象
   */
  const onClickTreeNode = async (node: ITreeNode, e: MouseEvent) => {
    const oldPath = router.currentRoute.value.fullPath;

    // 如果当前启用router跳转，则会使用节点path数据进行跳转
    if (props.router && node.path) {
      await router.push(node.path as string);
    }

    const currentPath = router.currentRoute.value.fullPath;

    /** 如果路由没有发生变化，则不处理 */
    if (oldPath === currentPath && node.path) return;

    /**
     * 根据配置，在节点点击时是否展开或折叠节点
     * 1. 开启 expandOnClickNode 配置时
     * 2. 菜单未处于折叠状态时
     * 3. 节点未展开时，点击节点会展开节点
     */
    if (props.expandOnClickNode && !props.collapse && (!isExpanded(node) || !node.path)) {
      toggleExpand(node);
    }

    /** 启动路由模式且节点数据没有path时不需要选中 */
    if (props.router && !node.path) return;

    // 如果该节点不是当前选中的节点，抛出当前节点改变事件
    if (!isCurrent(node)) {
      emits(CURRENT_CHANGE, node.data, node);
      currentNode.value = node.key; // 更新当前选中的节点
    }

    // 抛出节点点击事件
    emits(NODE_CLICK, node.data, node, e);
  };

  /**
   * 获取当前节点对象
   * @param {TreeKey | TreeNodeData} data - 节点的 key 或节点数据对象
   * @returns {ITreeNode | undefined} - 返回对应的树节点对象，如果不存在则返回 undefined
   */
  const getCurrentNode = (data: TreeKey | TreeNodeData): ITreeNode | undefined => {
    const key = typeof data === 'object' && data !== null ? getKey(data) : data; // 获取节点 key
    return tree.value?.treeNodesMap.get(key); // 根据 key 从 treeNodesMap 中查找节点
  };

  /**
   * 根据节点的 key 获取对应的树节点对象
   * @param {TreeKey} key - 节点的唯一标识 key
   * @returns {ITreeNode | undefined} - 返回对应的树节点对象，如果不存在则返回 undefined
   */
  const getNodeByKey = (key: TreeKey): ITreeNode | undefined => tree.value?.treeNodesMap.get(key);

  /**
   * 获取当前选中节点的 key
   * @returns {TreeKey | undefined} - 返回当前选中的节点 key，如果没有选中节点则返回 undefined
   */
  const getCurrentKey = (): TreeKey | undefined => {
    return currentNode.value;
  };

  /**
   * 获取当前选中节点
   * @returns {TreeNodeData | undefined} - 返回当前选中的节点 key，如果没有选中节点则返回 undefined
   */
  const getCurrentData = (): TreeNodeData | undefined => {
    return getNodeByKey(<string | number>currentNode.value);
  };

  /**
   * 检查指定节点是否是当前选中的节点并且处于折叠状态
   * @param node - 需要检查的树节点
   */
  const isCollapseCurrent = (node: ITreeNode): boolean => {
    if (!props.collapse) return false;
    const currentData = getCurrentData();
    return getNodeByKey(currentData?.rootId)?.key === node.key;
  };

  /**
   * 将指定的节点滚动到可视区域
   * @param  key - 目标节点的唯一标识 key
   * @param [isTop=true] - 是否将节点滚动到顶部（默认 true 为顶部）
   */
  const scrollToTarget = (key: TreeKey, isTop = true) => {
    const currIndex = flattenList.value.findIndex(node => node.key === key);

    // 如果节点不存在于列表中，直接返回
    if (currIndex === -1) return;

    // 根据 isTop 参数选择滚动方式
    const virList = virListRef.value;
    if (!virList) return;

    if (isTop) {
      virList.scrollToIndex(currIndex); // 滚动到指定索引位置
    } else {
      virList.scrollIntoView(currIndex); // 滚动到指定索引位置，确保节点可见
    }
  };

  /**
   * 滚动到指定节点的根节点
   * @param key
   * @param [isTop=true] - 是否将节点滚动到顶部（默认 true 为顶部）
   */
  const scrollToRootNode = (key: TreeKey, isTop = true) => {
    const node = tree.value?.treeNodesMap.get(key);
    if (!node) return; // 避免 node 为空时报错

    const localRootNode = findRootNode(node);
    scrollToTarget(localRootNode.key, isTop);
  };

  /**
   * 根据节点的 key 展开指定节点并展开所有父节点
   * @param {TreeKey} key - 目标节点的唯一标识 key
   */
  const expandNodeByKey = async (key: TreeKey) => {
    if (!key && key !== 0) return;
    const targetItem = tree.value?.treeNodesMap.get(key);
    if (!targetItem) return;
    // 根据节点展开的时候需要展开所有父亲节点
    expandParents(targetItem);
    triggerRef(expandedKeysSet);
    // 滚动到目标节点，确保其可见
    scrollToTarget(key, false);
  };

  /**
   * 设置当前选中的节点 key
   * @param {TreeKey} key - 要设置为当前选中的节点 key
   */
  const setCurrentKey = (key: TreeKey): void => {
    if (!props.collapse) {
      expandNodeByKey(key);
    } else {
      scrollToRootNode(key, false);
    }

    currentNode.value = key;
  };

  /**
   * 设置当前展开的节点 keys
   * @param {TreeKey[]} keys - 需要展开的节点 keys 列表
   */
  const setExpandedKeys = (keys: TreeKey[]): void => {
    // 设置展开项时，确保所有父级节点也展开
    keys.forEach(key => {
      const node = tree.value?.treeNodesMap.get(key); // 获取对应的树节点
      if (node) {
        expandParents(node); // 展开该节点的所有父节点
      }
    });
    triggerRef(expandedKeysSet); // 触发响应式更新
  };

  /**
   * 展开所有节点
   */
  const expandAllNodes = () => {
    expandedKeysSet.value = parentNodeKeys;
    triggerRef(expandedKeysSet);
  };

  /**
   * 收起所有节点
   */
  const collapseAllNods = () => {
    expandedKeysSet.value = new Set([]);
    triggerRef(expandedKeysSet);
  };

  /**
   * 滚动事件
   * @param e
   */
  const onScroll = (e: Event) => {
    emits(TREE_SCROLL, e);
  };

  /**
   * 根据节点的 key 折叠指定节点
   * @param {TreeKey} key - 目标节点的唯一标识 key
   */
  const collapseNodeByKey = (key: TreeKey): void => {
    // 如果该节点当前没有展开，则不做任何操作
    if (!expandedKeysSet.value.has(key)) return;

    // 从已展开的集合中删除该节点
    expandedKeysSet.value.delete(key);
    triggerRef(expandedKeysSet);
  };

  /**
   * 滚动到列表底部
   */
  const scrollToBottom = (): void => {
    virListRef.value?.scrollToBottom();
  };

  /**
   * 滚动到列表顶部
   */
  const scrollToTop = (): void => {
    virListRef.value?.scrollToTop();
  };

  /**
   * 根据查询字符串过滤节点，并展开匹配的节点
   * @param {string} query - 要匹配的查询字符串
   */
  const filter = (query: string): void => {
    const keys = doFilter(query); // 进行查询并返回匹配的节点 keys
    if (keys) {
      expandedKeysSet.value = keys;
      triggerRef(expandedKeysSet);
    }
  };

  /**
   * 关闭折叠内容。
   *
   * @param {boolean} show - 是否显示折叠内容。
   * @param isImmediateClose - 是否立即关闭。
   */
  const toggleCollapseContent = (show: boolean, isImmediateClose = false) => {
    clearTimeout(timeout.value as number);

    timeout.value = setTimeout(
      () => {
        isShowCollapseContent.value = show;
        if (!show) currentHoverNode.value = {} as ITreeNode;
      },
      isImmediateClose ? 0 : 200
    );
  };

  /**
   * 当鼠标进入节点时触发，更新位置信息并显示子节点选项。
   *
   * @param {ITreeNode} node - 当前鼠标进入的树节点。
   * @param {MouseEvent} event - 鼠标事件。
   */
  const onMouseenter = debounce(async (node: ITreeNode, event: MouseEvent) => {
    // 如果当前节点与上次鼠标悬停的节点相同，则不处理
    if (currentHoverNode.value?.key === node?.key) return;

    // 先隐藏内容以确保动画效果
    isShowCollapseContent.value = false;

    const targetElement = event?.target as HTMLElement;
    const { width = 0, top = 0 } = targetElement?.getBoundingClientRect() || {};

    // 更新节点位置信息
    position.value = { left: width, top };

    // 更新选项内容
    options.value = node.children || [];

    // 处理完 DOM 更新后显示内容
    await nextTick();
    isShowCollapseContent.value = true;

    // 更新当前悬停节点
    currentHoverNode.value = node;
  }, 250);

  /**
   * 检查 URL 路径和查询参数是否与给定的值匹配
   * @param {string} url 需要检查的 URL
   * @param {Record<string, string>} queryParams 对象格式的查询参数
   * @returns {boolean} 如果 URL 路径和查询参数完全匹配，则返回 true；否则返回 false
   */
  const matchUrlParams = (url: string, queryParams: Record<string, string>): boolean => {
    // 先检查 queryParams 中是否有 url 参数
    const expectedPath = queryParams.url;

    // 如果 queryParams 中没有 url 参数，直接返回 false
    if (!expectedPath) {
      return false;
    }

    // 创建 URL 对象，方便解析路径和查询参数
    const urlObj = new URL(url, window.location.origin);

    // 检查路径部分是否匹配 queryParams 中的 url 参数
    if (urlObj.pathname !== expectedPath) {
      return false; // 如果路径不匹配，返回 false
    }

    // 获取 URL 查询参数
    const urlSearchParams = new URLSearchParams(urlObj.search);

    // 遍历 queryParams，检查每个查询参数是否匹配
    const mismatch = Object.entries(queryParams).find(([key, value]) => {
      // 跳过 url 参数，因为已经匹配过路径部分
      if (key === 'url') return false;
      // 如果 URL 中没有该键，或值不匹配，则返回不匹配
      return urlSearchParams.get(key) !== value;
    });

    // 如果有不匹配的项，返回 false；否则返回 true
    return !mismatch;
  };

  /**
   * 通过path查找节点对应的key
   * @param path
   */
  const findPathByKey = (path: string) => {
    const currentTreeNode = flattenTree.value?.find(item => item.path === path);
    if (currentTreeNode) {
      return currentTreeNode;
    }

    return flattenTree.value.find(item =>
      matchUrlParams(path, item.parseUrlObj as Record<string, string>)
    );
  };

  /**
   * 通过path数组查找所有节点对应key
   * @param path
   */
  const findPathByKeys = (path: TreeKey[]) =>
    path
      ?.map(key => findPathByKey(key as string)?.[valueKey.value as keyof ITreeNode] as TreeKey)
      .filter(Boolean);

  /**
   * 通过路径重新匹配当前选中节点
   * 当菜单数据刷新后uuid变化导致原key找不到时，通过path重新匹配
   */
  const reMatchCurrentNodeByPath = async () => {
    const currentKey = currentNode.value;
    if (currentKey && !tree.value?.treeNodesMap.get(currentKey)) {
      const currentPath = cleanPath(router.currentRoute.value.fullPath);
      const node = findPathByKey(currentPath);
      if (node) {
        await nextTick();
        setCurrentKey(node[valueKey.value as keyof ITreeNode] as TreeKey);
      }
    }
  };

  /**
   * 处理 mouseover 和 mouseleave 事件的公共函数
   *
   * @param {Event} evt - 触发的事件对象，包含事件相关的目标元素等信息
   */
  const handleMouseEvent = (evt: Event) => {
    const virListEl = virListRef.value?.$el?.querySelector('.virtually-menu-container');
    const collapseAnimationEl = document.querySelector('.collapse-animation');

    // 检查事件目标是否在虚拟列表或 collapse 动画元素内部
    if (
      !virListEl?.contains(evt.target as Node) &&
      !collapseAnimationEl?.contains(evt.target as Node)
    ) {
      onMouseenter.cancel();
      toggleCollapseContent(false);
    }
  };

  useEventListener(document, 'mouseover', handleMouseEvent);

  useEventListener(document, 'mouseleave', handleMouseEvent);

  watch(
    () => props.data,
    (data: TreeData) => {
      // parentNodeKeys.clear();
      setTreeData(data);
      // virListRef.value?.forceUpdate();

      // 数据更新后通过path重新匹配选中节点，解决uuid变化导致高亮丢失
      reMatchCurrentNodeByPath();
    },
    {
      immediate: true,
      deep: true,
    }
  );

  watch(
    () => props.defaultActive,
    async key => {
      /** 增加自定义路由参数忽略匹配功能 */
      const path = cleanPath(key);
      const node = findPathByKey(path);
      // 等待渲染主线程完成任务后再执行延迟队列内容，防止此时拿到的元素宽高计算异常
      setTimeout(() => {
        setCurrentKey(node?.[valueKey.value as keyof ITreeNode] as TreeKey);
      });
    },
    {
      immediate: true,
    }
  );

  watch(
    () => props.defaultExpandedKeys,
    keys => {
      const key = findPathByKeys(keys);
      setExpandedKeys(key);
    },
    {
      immediate: true,
    }
  );

  watch(
    () => props.collapse,
    value => {
      if (value) {
        // expandNodeCollapseKey.value = expandedKeysSet.value;
        collapseAllNods();
        setTimeout(() => {
          scrollToRootNode(currentNode.value);
        });
      } else {
        // 重置虚拟列表，并展开当前节点
        virListRef.value?.reset();

        // 等待渲染进程渲染完成后再展开当前节点
        setTimeout(() => {
          currentNode.value && expandNodeByKey(currentNode.value);
        });
        // expandNodeCollapseKey.value?.forEach(key => {
        //     expandNodeByKey(key);
        // });
      }
    }
  );

  onBeforeUnmount(() => {
    clearTimeout(timeout.value as number);
  });

  return {
    position,
    virListRef,
    tree,
    flattenList,
    options,
    isShowCollapseContent,
    currentNode,
    onScroll,
    onMouseenter,
    filter,
    isForceHiddenExpandIcon,
    setTreeData,
    toggleExpand,
    expandNode,
    collapseNode,
    onClickTreeNode,
    isExpanded,
    isCurrent,
    isCollapseCurrent,
    getCurrentNode,
    getCurrentKey,
    setCurrentKey,
    setExpandedKeys,
    getNodeByKey,
    expandAllNodes,
    collapseAllNods,
    expandNodeByKey,
    collapseNodeByKey,
    scrollToBottom,
    scrollToTarget,
    scrollToTop,
    toggleCollapseContent,
  };
};
