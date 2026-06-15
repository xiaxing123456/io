# plt-tree 树形控件

-   基于 vxe-grid
-   [vxe-grid 文档地址](https://vxetable.cn/#/table/tree/basic)
-   [sortablejs 文档地址](http://www.sortablejs.com/)

## 基础用法

<preview path="../../../../../docs/docs/simples/plt-tree/basic-usage.vue"></preview>

## checkbox 勾选框

<preview path="../../../../../docs/docs/simples/plt-tree/checkbox-tree.vue"></preview>

## filter 筛选

<preview path="../../../../../docs/docs/simples/plt-tree/filter-tree.vue"></preview>

## draggable 拖拽

<preview path="../../../../../docs/docs/simples/plt-tree/draggable.vue"></preview>

## 大量数据

<preview path="../../../../../docs/docs/simples/plt-tree/large-data.vue"></preview>

## **参数**

| 参数名                | 描述                                                                         | 类型            | 默认值 |
| --------------------- | ---------------------------------------------------------------------------- | --------------- | ------ |
| data                  | 展示数据                                                                     | array           | —      |
| empty-text            | 内容为空的时候展示的文本                                                     | string          | —      |
| highlight-current     | 是否高亮当前选中节点                                                         | boolean         | false  |
| default-expand-all    | 是否默认展开所有节点                                                         | boolean         | false  |
| expand-on-click-node  | 展开或者收缩节点方式, 默认 false 点击 icon 才会展开,true 是点击 row 就会触发 | boolean         | false  |
| default-expanded-keys | 默认展开的节点的 key 的数组                                                  | array           | —      |
| show-checkbox         | 节点是否可被选择                                                             | boolean         | false  |
| default-checked-keys  | 默认勾选的节点的 key 的数组                                                  | array           | —      |
| current-node-key      | 当前选中的节点                                                               | string / number | —      |
| accordion             | 是否每次只打开一个同级树节点展开                                             | boolean         | false  |
| sortable-option       | sortablejs 配置项                                                            | {}              | —      |

## **方法**

| 方法            | 描述                                           | 参数                                                                                      |
| --------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| filter          | 过滤所有树节点，过滤后的节点将被隐藏           | (value, key) 接收两个参数: 1. 要搜索的 value 2. key 要搜索的字段名，默认为 label 字段     |
| remove          | 删除 Tree 中的一个节点                         | (id) 接收一个参数: 要删除的节点的 data                                                    |
| getCurrentRow   | 返回当前被选中节点的数据 (如果没有则返回 null) | —                                                                                         |
| setCurrentRow   | 通过 id 设置某个节点的当前选中状态             | (id) 接收一个参数: 要选中的节点的 id                                                      |
| clearCurrentRow | 清除当前选中状态                               | —                                                                                         |
| getCheckedRow   | 返回当前被选中节点的数据 (如果没有则返回 [])   | —                                                                                         |
| setCheckedRow   | 通过 id 设置某个节点的当前勾选状态             | (id) 接收一个参数: 要勾选中的节点的 id, 可以是单个 string、number 或者 string[]、number[] |
| clearCheckedRow | 清除所有勾选状态                               | —                                                                                         |
| setTreeExpand   | 设置树展开                                     | (id) 接收一个参数: 要展开的节点的 id, 可以是单个 string、number 或者 string[]、number[]   |
| clearTreeExpand | 设置树关闭                                     |                                                                                           |

## **事件**

| 事件           | 描述                         | 回调参数 |
| -------------- | ---------------------------- | -------- |
| node-click     | 当节点被点击的时候触发       |          |
| node-expand    | 节点被展开时触发的事件       |          |
| node-collapse  | 节点被关闭时触发的事件       |          |
| current-change | 当前选中节点变化时触发的事件 |          |
| check-change   | 当复选框被点击的时候触发     |          |
| drag-end       | 拖拽结束后触发               |          |

## **注意事项**

如果树节点的内容是多个字段拼接而成, 某部分内容搜索后包含搜索的关键字，但是不能被高亮 请加上类名 not-highlight
