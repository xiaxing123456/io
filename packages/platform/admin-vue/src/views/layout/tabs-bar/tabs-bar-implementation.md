# Tabs Bar 复刻实现方案

> 参考源文件：`D:\xiaxing\dms\code\PIMCenter4.0\code\5.4\dev\packages\platform-config-engine\src\views\layout\tabs-bar\tabs-bar.vue`
>
> 目标目录：`packages/platform/admin-vue/src/views/layout/tabs-bar`

## 1. 源项目 Tabs Bar 实现概览

源项目的 `tabs-bar.vue` 不是一个单纯的展示组件，而是把以下能力集中在一个组件里：

1. **多标签页展示**：横向渲染已打开页面，当前标签高亮。
2. **路由切换**：点击标签时通过 `router.push(item.path)` 切换页面。
3. **关闭标签**：支持关闭当前标签、关闭非当前标签。
4. **右键菜单**：右键标签弹出菜单，支持刷新、关闭、关闭其他、关闭所有。
5. **横向溢出滚动**：标签过多时显示左移、右移按钮和全部标签下拉。
6. **菜单联动**：根据当前路由 query 中的菜单标识，在菜单树中反查标签标题和图标。
7. **路由联动**：监听路由变化，自动新增、激活、移动标签。
8. **刷新前校验**：刷新前检查记录窗口和页面校验状态，必要时弹确认框。
9. **广播刷新**：确认刷新后通过全局广播通知当前页面刷新。

源项目核心设计是：**路由变化驱动标签页状态变化，标签页点击/关闭再反过来触发路由跳转。**

---

## 2. 源项目关键状态和交互

### 2.1 标签数据结构

源项目标签数据大致为：

```ts
export interface TabBarListOptions {
  path: string;
  title: string;
  icon: string;
}
```

组件运行时还会给每个 tab 临时补充 `index` 字段，用于 DOM 宽度计算和滚动定位。

### 2.2 组件局部状态

源组件内部主要维护：

| 状态 | 作用 |
| --- | --- |
| `activeBar` | 当前激活标签索引 |
| `barsList` | 从 store 读取的标签列表 |
| `bars.barsData` | 组件内部操作用的标签缓存 |
| `barsRefs` | 每个标签 DOM 引用，用于计算宽度和位置 |
| `tabsBarBoxRef` | 标签列表容器 DOM 引用 |
| `showLeft` / `showRight` | 是否显示左移/右移按钮 |
| `showMoveBtns` | 是否出现横向溢出，决定是否展示移动按钮和全部下拉 |
| `visible` / `left` / `top` | 右键菜单显隐和位置 |
| `activePanel` | 当前右键操作的标签索引 |
| `isClose` / `isCloseAll` / `closeIndex` | 关闭流程状态标记 |
| `clickType` | 区分顶部标签点击、关闭、侧边栏菜单点击 |

### 2.3 路由 query 依赖

源项目高度依赖路由 query 参数：

| query | 作用 |
| --- | --- |
| `pathId` | 菜单 ID，用于从菜单树反查标题 |
| `shellId` | 工作区/外壳 ID，用于隔离不同工作区的标签 |
| `navigationType` | 导航模式，用于过滤标签 |
| `shortcut` | 快捷入口标识，用于去重和恢复 |
| `reShellId` / `isShell` | 外壳跳转场景 |

当前 `admin-vue` 还没有 `shellId/pathId` 这套工作区模型，已有的是 `menuCode` 和 `navigationType`。现在 store 已经按 `MenuStatus` 分组缓存菜单、tabs 和 KeepAlive 组件名，因此复刻时建议：

- 用 `menuCode` 作为菜单标识；
- 用 `navigationType` 决定读写哪一组缓存；
- 切换导航模式时，切换当前工作组，并按需要清空旧模式或当前模式的 `cachedViewNames`，避免不同模式复用错误的页面缓存。

---

## 3. 当前 admin-vue 现状

当前项目已经有一些基础，但还不是完整 Tabs Bar。

### 3.1 已有基础

| 文件 | 现状 |
| --- | --- |
| `packages/platform/admin-vue/src/views/layout/main/main.vue` | 已经在 header 下方挂载 `<app-tabs-bar />` |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.vue` | 只做静态列表渲染，展示 `item.name` |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 当前仍需改成根据 `systemModuleAccess.state.navigationType` 读取对应模式的 `tabBarlist` |
| `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | 已按 `MenuStatus` 分组管理 `menulist/tabBarlist/cachedViewNames`，并有全局 `activeTabFullPath/navigationType` |
| `packages/platform/admin-vue/src/views/layout/nav/nav.ts` | 菜单初始化后会写入第一个 tab |
| `packages/platform/admin-vue/src/router/modules/index.ts` | 路由已有 `meta.title`，可作为标签标题兜底来源 |

### 3.2 当前缺口

1. `tabs-bar.vue` 没有激活态、关闭按钮、右键菜单、横向滚动。
2. `tabs-bar.ts` 没有监听路由，也不会点击切换路由。
3. `system-module-access` 已开始扩展为分导航模式缓存结构，但 tabs-bar、route sync、main KeepAlive 还需要改成按当前 `navigationType` 读取。
4. `nav.ts` 只初始化第一个标签，没有完全交给 store 根据当前导航模式初始化默认 tab。
5. `main.vue` 的内容区目前是静态 `222`，没有渲染子路由 `<router-view />`。
6. 没有 `KeepAlive` 缓存页面。
7. 路由守卫 `UseRouteGuardOptions.afterEach` 类型存在，但 `useRouteGuard` 当前没有注册 `router.afterEach`。
8. 没有刷新前校验、全局广播刷新、记录窗口联动能力。

---

## 4. 想实现相同效果，需要写/改哪些代码

建议分成两层：

- **基础版**：多标签展示、路由联动、关闭、关闭其他、关闭全部、溢出滚动、全部下拉。
- **增强版**：KeepAlive 缓存、刷新当前页、关闭/刷新前确认、全局刷新广播、标签持久化。

下面按文件说明需要写的代码。

---

## 5. 文件改造清单

| 文件 | 类型 | 说明 |
| --- | --- | --- |
| `packages/platform/admin-vue/src/stores/modules/system-module-access/index.type.ts` | 修改 | 扩展 `TabBarListOptions`，补充标题、图标、完整路径、缓存等字段 |
| `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | 修改 | 增加 `addTab`、`removeTab`、`closeOtherTabs`、`closeAllTabs`、`setActiveTab`、`removeCachedView` 等 actions |
| `packages/platform/admin-vue/src/router/index.type.ts` | 修改 | 给 `RouteMetaCustomizeOptions` 增加 `hiddenTab`、`affix`、`keepAlive`、`icon` 等配置 |
| `packages/platform/admin-vue/src/router/tools/guard.ts` | 修改 | 注册 `router.afterEach`，或在路由初始化处调用 tabs 同步函数 |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.type.ts` | 修改 | 与 store 中的 `TabBarListOptions` 对齐，避免 `name/title` 不一致 |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 重写/扩展 | 实现 tabs 的路由同步、点击、关闭、右键菜单、滚动逻辑 |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.vue` | 重写/扩展 | 实现完整 UI：左右按钮、标签项、关闭按钮、下拉、右键菜单 |
| `packages/platform/admin-vue/src/views/layout/main/main.vue` | 修改 | 内容区改为子路由出口，并按需接入 `KeepAlive` |
| `packages/platform/admin-vue/src/views/layout/nav/nav.ts` | 小改 | 菜单 URL 保持稳定 query，保证 `menuCode/navigationType` 可用于 tab 去重 |
| `packages/platform/admin-vue/src/composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts` | 新增，推荐 | 把路由和 tab 的同步逻辑从组件中拆出来 |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-scroll.ts` | 新增，推荐 | 把横向滚动、宽度计算、resize 监听拆出来 |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-context-menu.ts` | 新增，推荐 | 把右键菜单逻辑拆出来 |
| `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-refresh.ts` | 新增，可选 | 实现刷新当前 tab、清理缓存、刷新广播等增强能力 |

### 5.1 函数/方法落地位置速查

> 这里把文档中提到的函数统一标明推荐文件位置。建议优先按这个位置拆分，不要把所有逻辑都塞进 `tabs-bar.vue`。

| 函数/方法 | 推荐文件位置 | 说明 |
| --- | --- | --- |
| `setupTabBarRouteSync(router)` | `packages/platform/admin-vue/src/composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts` | 对外暴露的路由同步入口，在路由初始化后调用，内部注册 `router.afterEach` 或执行首次同步。 |
| `syncRouteToTab(route)` | `packages/platform/admin-vue/src/composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts` | 当前路由进入 tab 的核心函数：判断是否隐藏、生成 tab、写入 store、设置激活 tab。不要放到 `router/tools/common.ts`，它是 tabs-bar 业务同步逻辑。 |
| `createTabFromRoute(route)` | `packages/platform/admin-vue/src/composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts` | 把 `RouteLocationNormalizedLoaded` 转成 `TabBarListOptions`。 |
| `findMenuByCode(menus, menuCode)` | `packages/platform/admin-vue/src/composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts` 或 `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 从当前 `navigationType` 对应分组的 `menulist` 中按 `menuCode` 查找菜单标题和图标；如果后续多处复用，再抽到通用工具。 |
| `normalizePath(url)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | tabs-bar 内部路径比较工具：统一 query 顺序，避免同一路径因参数顺序不同被当作不同 tab。 |
| `isSamePath(a, b)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 基于 `normalizePath` 判断两个 tab 路径是否一致。 |
| `removeQueryKeys(url, keys)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 可选工具；后续如果支持类似源项目 `shortcut` 的特殊参数，可用它忽略某些 query 做去重。 |
| `tabsBar()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | `tabs-bar.vue` 的组合式入口，负责组装 store、router、滚动、右键菜单、刷新等逻辑并返回给模板。 |
| `toggleBar(tab)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 点击 tab 时跳转路由。 |
| `closeBar(tab)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 关闭单个 tab，并在关闭当前 tab 时跳转到相邻 tab。 |
| `closeContextTab()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 右键菜单中的“关闭”动作；内部通常复用 `closeBar(contextMenuTarget)`。 |
| `closeOtherTabs()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 右键菜单中的“关闭其他”动作；内部调用 store 的 `closeOtherTabs(fullPath)`。 |
| `closeAllTabs()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/tabs-bar.ts` | 右键菜单中的“关闭所有”动作；内部调用 store 的 `closeAllTabs()` 并跳转首页 tab。 |
| `refreshCurrentTab()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-refresh.ts`，由 `tabs-bar.ts` 引入使用 | 刷新当前 tab。基础版可通过 router-view key 重渲染；增强版再做 KeepAlive 缓存清理/广播刷新。 |
| `setBarRef(el, index)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-scroll.ts`，由 `tabs-bar.ts` 引入使用 | 收集每个 tab DOM，用于宽度和滚动位置计算。 |
| `updateMoveStatus()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-scroll.ts` | 计算 tab 总宽度是否超过容器宽度，决定是否显示左右按钮/下拉。 |
| `move(type)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-scroll.ts` | 左右翻页移动 tab 列表。 |
| `scrollActiveTabIntoView()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-scroll.ts` | 当前激活 tab 变化时，自动滚动到可见区域。 |
| `getCurrentTranslateX(el)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-scroll.ts` | 读取当前横向位移，供 `move` 和自动滚动使用。 |
| `getMaxMoveDistance()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-scroll.ts` | 计算最大可横向移动距离。 |
| `openContextMenu(event, index)` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-context-menu.ts`，由 `tabs-bar.ts` 引入使用 | 右键 tab 时打开菜单并记录目标 tab。 |
| `closeContextMenu()` | `packages/platform/admin-vue/src/views/layout/tabs-bar/use-tab-bar-context-menu.ts` | 点击外部或操作完成后关闭右键菜单。 |
| `getCurrentNavigationState()` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | 推荐新增内部 helper：根据 `state.navigationType` 返回当前模式的 `{ menulist, tabBarlist, cachedViewNames }`。 |
| `setNavigationType(navigationType, options?)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | 推荐新增 Pinia action：切换当前导航模式，并可在切换时清空旧模式/新模式缓存组件。 |
| `clearCachedViews(navigationType?)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | 推荐新增 Pinia action：清空指定导航模式的 KeepAlive include 列表；不传则清空当前模式。 |
| `addTab(tab)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | Pinia action：写入当前 `navigationType` 对应的 `tabBarlist`，按 `fullPath` 去重。 |
| `removeTab(fullPath)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | Pinia action：从当前模式 `tabBarlist` 删除指定 tab，同时清理当前模式缓存。 |
| `setActiveTab(fullPath)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | Pinia action：记录全局当前激活 tab。 |
| `closeOtherTabs(fullPath)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | Pinia action：在当前模式下保留固定 tab 和目标 tab。 |
| `closeAllTabs()` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | Pinia action：只关闭当前模式可关闭 tab，保留当前模式固定 tab。 |
| `addCachedView(name, navigationType?)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | Pinia action：向指定/当前导航模式添加 KeepAlive include 组件名。 |
| `removeCachedView(name, navigationType?)` | `packages/platform/admin-vue/src/stores/modules/system-module-access/index.ts` | Pinia action：从指定/当前导航模式删除 KeepAlive include 组件名。 |

#### 推荐调用关系

```txt
router 初始化
  └─ setupTabBarRouteSync(router)
       └─ router.afterEach(to => syncRouteToTab(to))
            ├─ createTabFromRoute(to)
            │   ├─ 解析 route.query.navigationType
            │   └─ findMenuByCode(state[navigationType].menulist, menuCode)
            ├─ systemModuleAccess.setNavigationType(tab.navigationType)
            ├─ systemModuleAccess.addTab(tab) // 写入 state[navigationType].tabBarlist
            ├─ systemModuleAccess.setActiveTab(tab.fullPath)
            └─ systemModuleAccess.addCachedView(tab.componentName, tab.navigationType) // 可选

tabs-bar.vue
  └─ tabsBar()  // 来自 tabs-bar.ts
       ├─ useTabBarScroll()
       ├─ useTabBarContextMenu()
       ├─ useTabRefresh()
       ├─ toggleBar(tab)
       ├─ closeBar(tab)
       ├─ closeOtherTabs()
       └─ closeAllTabs()
```

#### 文件职责边界

- `router/tools/common.ts`：只放通用路由工具，例如 `isIgnoreLoginPath`。不建议放 `syncRouteToTab`，因为它依赖 tabs store 和菜单数据，是布局 tabs-bar 的业务逻辑。
- `composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts`：放“路由 -> tab”的同步逻辑。
- `tabs-bar/tabs-bar.ts`：放“tab UI 操作 -> 路由/store”的组装逻辑。
- `system-module-access/index.ts`：放真正修改当前导航模式下 `tabBarlist`、`menulist`、`cachedViewNames`，以及全局 `activeTabFullPath/navigationType` 的 actions。
- `tabs-bar.vue`：只写模板和样式，尽量不写复杂业务。

---

## 6. 推荐的数据模型

当前项目的 `TabBarListOptions` 是：

```ts
export type TabBarListOptions = {
  name: string;
  path: string;
};
```

要实现源项目相同效果，建议改成：

```ts
export type TabBarListOptions = {
  /** 展示标题，建议统一使用 title，不再使用 name */
  title: string;
  /** 跳转地址，可以直接 router.push(path) */
  path: string;
  /** 完整路径，含 query，用于唯一匹配 */
  fullPath: string;
  /** 路由 name，用于 keep-alive 或权限判断 */
  routeName?: string;
  /** 菜单编码，当前项目可用它替代源项目 pathId */
  menuCode?: string;
  /** 导航类型 */
  navigationType?: MenuStatus;
  /** 图标 */
  icon?: string;
  /** 是否固定标签，例如首页 */
  affix?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否缓存 */
  keepAlive?: boolean;
  /** KeepAlive include 使用的组件名 */
  componentName?: string;
};
```

> 注意：建议统一使用 `title`，不要同时存在 `name` 和 `title`，否则 tabs-bar、store、菜单、路由之间容易出现字段不一致。

---

## 7. Store 需要补充的能力

建议在 `system-module-access` 中把标签页能力收敛到 store，而不是全写在组件里。当前 store 已经改成“按导航模式分组”的结构，因此后续所有菜单、tabs、KeepAlive 缓存都应该通过当前 `navigationType` 定位到对应分组。

### 7.1 当前 State 结构

当前建议以这个结构为准：

```ts
export type SystemModuleAccessState = {
  /** 当前激活 tab，跨导航模式只保留一个当前值 */
  activeTabFullPath: string;
  /** 当前导航模式 */
  navigationType: MenuStatus | null;
  /** 公司管理模式缓存 */
  [MenuStatus.CompanyManagement]: SystemNavigationOptions;
  /** 公司用户模式缓存 */
  [MenuStatus.CompanyPerson]: SystemNavigationOptions;
};

export type SystemNavigationOptions = {
  /** 当前模式菜单树 */
  menulist: MenuTreeOptions[];
  /** 当前模式 tabs */
  tabBarlist: TabBarListOptions[];
  /** 当前模式 KeepAlive include 组件名 */
  cachedViewNames: string[];
};
```

这个结构的含义是：

- `state.navigationType` 决定当前页面读写哪一组数据。
- `state[MenuStatus.CompanyManagement]` 保存公司管理模式下的菜单、tabs、缓存组件。
- `state[MenuStatus.CompanyPerson]` 保存公司用户模式下的菜单、tabs、缓存组件。
- `activeTabFullPath` 放在外层，代表当前真正激活的 tab。

### 7.2 推荐 helper

建议在 `system-module-access/index.ts` 中增加几个内部 helper，避免每个 action 都手写 `state[state.navigationType]`。

```ts
const getNavigationState = (navigationType?: MenuStatus | null) => {
  const type = navigationType || state.navigationType;
  if (!type) return;

  return state[type];
};

const getTabNavigationType = (tab: TabBarListOptions) => {
  return tab.navigationType || state.navigationType;
};
```

如果不想让 helper 访问 `state`，也可以写在 store 内部 actions 上方。

### 7.3 Actions 建议

至少需要：

```ts
const actions = {
  /** 切换当前导航模式 */
  setNavigationType(
    navigationType: MenuStatus,
    options: {
      /** 切换模式时是否清空上一个模式的 KeepAlive 缓存 */
      clearPreviousCachedViews?: boolean;
      /** 切换模式时是否清空目标模式的 KeepAlive 缓存 */
      clearTargetCachedViews?: boolean;
    } = {}
  ) {
    const previousNavigationType = state.navigationType;

    if (previousNavigationType === navigationType) return;

    if (options.clearPreviousCachedViews && previousNavigationType) {
      actions.clearCachedViews(previousNavigationType);
    }

    if (options.clearTargetCachedViews) {
      actions.clearCachedViews(navigationType);
    }

    state.navigationType = navigationType;

    const navigationState = getNavigationState(navigationType);
    state.activeTabFullPath = navigationState?.tabBarlist[0]?.fullPath || '';
  },

  /** 设置当前模式菜单列表 */
  setMenuList(data: MenuTreeOptions[], navigationType?: MenuStatus) {
    const type = navigationType || state.navigationType || data[0]?.navigationType;
    if (!type) return;

    const navigationState = getNavigationState(type);
    if (!navigationState) return;

    navigationState.menulist = data;

    // 清理菜单里已经不存在的非固定 tab，固定 tab 保留。
    navigationState.tabBarlist = navigationState.tabBarlist.filter(tab => {
      if (tab.affix) return true;
      return hasMenuByUrl(data, tab.fullPath);
    });

    // 如果当前还没有导航模式，使用本次菜单所属模式作为当前模式。
    if (!state.navigationType) {
      state.navigationType = type;
    }

    // 初始化当前模式默认固定 tab。
    const defaultMenu = findFirstAvailableMenu(data);
    if (!defaultMenu) return;

    const defaultTab = createTabByMenu(defaultMenu);
    const hasDefaultTab = navigationState.tabBarlist.some(
      tab => tab.fullPath === defaultTab.fullPath
    );

    if (!hasDefaultTab) {
      navigationState.tabBarlist.unshift(defaultTab);
    }

    if (state.navigationType === type && !state.activeTabFullPath) {
      state.activeTabFullPath = defaultTab.fullPath;
    }
  },

  /** 设置当前模式 tab 列表 */
  setTabBarList(data: TabBarListOptions[], navigationType?: MenuStatus) {
    const navigationState = getNavigationState(navigationType);
    if (!navigationState) return;

    navigationState.tabBarlist = data;
  },

  /** 设置当前激活 tab */
  setActiveTab(fullPath: string) {
    state.activeTabFullPath = fullPath;
  },

  /** 当前路由进入 tab：写入 tab.navigationType 对应分组；没有则写入当前 navigationType */
  addTab(tab: TabBarListOptions) {
    const type = getTabNavigationType(tab);
    const navigationState = getNavigationState(type);
    if (!navigationState) return;

    const tabIndex = navigationState.tabBarlist.findIndex(
      item => item.fullPath === tab.fullPath
    );

    if (tabIndex === -1) {
      navigationState.tabBarlist.push(tab);
    } else {
      navigationState.tabBarlist.splice(tabIndex, 1, {
        ...navigationState.tabBarlist[tabIndex],
        ...tab,
      });
    }

    state.activeTabFullPath = tab.fullPath;
  },

  /** 关闭当前模式指定 tab */
  removeTab(fullPath: string) {
    const navigationState = getNavigationState();
    if (!navigationState) return;

    const tab = navigationState.tabBarlist.find(item => item.fullPath === fullPath);
    navigationState.tabBarlist = navigationState.tabBarlist.filter(
      item => item.fullPath !== fullPath
    );

    if (state.activeTabFullPath === fullPath) {
      state.activeTabFullPath = navigationState.tabBarlist[0]?.fullPath || '';
    }

    if (tab?.componentName) {
      actions.removeCachedView(tab.componentName);
    }
  },

  /** 当前模式关闭其他 tab，保留首页/固定 tab 和当前 tab */
  closeOtherTabs(fullPath: string) {
    const navigationState = getNavigationState();
    if (!navigationState) return;

    const removeTabs = navigationState.tabBarlist.filter(
      item => !item.affix && item.fullPath !== fullPath
    );

    navigationState.tabBarlist = navigationState.tabBarlist.filter(
      item => item.affix || item.fullPath === fullPath
    );
    state.activeTabFullPath = fullPath;

    removeTabs.forEach(item => {
      if (item.componentName) {
        actions.removeCachedView(item.componentName);
      }
    });
  },

  /** 当前模式关闭全部可关闭 tab，保留首页/固定 tab */
  closeAllTabs() {
    const navigationState = getNavigationState();
    if (!navigationState) return;

    const removeTabs = navigationState.tabBarlist.filter(item => !item.affix);

    navigationState.tabBarlist = navigationState.tabBarlist.filter(item => item.affix);
    state.activeTabFullPath = navigationState.tabBarlist[0]?.fullPath || '';

    removeTabs.forEach(item => {
      if (item.componentName) {
        actions.removeCachedView(item.componentName);
      }
    });
  },

  /** 添加当前/指定模式缓存组件名 */
  addCachedView(name: string, navigationType?: MenuStatus) {
    if (!name) return;

    const navigationState = getNavigationState(navigationType);
    if (!navigationState || navigationState.cachedViewNames.includes(name)) return;

    navigationState.cachedViewNames.push(name);
  },

  /** 删除当前/指定模式缓存组件名 */
  removeCachedView(name: string, navigationType?: MenuStatus) {
    const navigationState = getNavigationState(navigationType);
    if (!navigationState) return;

    navigationState.cachedViewNames = navigationState.cachedViewNames.filter(item => item !== name);
  },

  /** 清空当前/指定模式缓存组件名 */
  clearCachedViews(navigationType?: MenuStatus) {
    const navigationState = getNavigationState(navigationType);
    if (!navigationState) return;

    navigationState.cachedViewNames = [];
  },
};
```

### 7.4 关键规则

1. `fullPath` 作为 tab 唯一 key，但只在同一个 `navigationType` 分组内去重。
2. 首页 tab 设置 `affix: true`、`closable: false`。
3. `addTab(tab)` 应优先使用 `tab.navigationType`，没有时使用 `state.navigationType`。
4. `removeTab/closeOtherTabs/closeAllTabs` 默认只操作当前 `state.navigationType` 分组。
5. 页面需要缓存时，把 `componentName` 放入当前模式的 `cachedViewNames`。
6. 关闭 tab 时同步移除当前模式下对应缓存。
7. 切换导航模式时，必须让 `main.vue` 的 `KeepAlive include` 改读新模式的 `cachedViewNames`。
8. 如果两个模式下可能存在同名组件但页面数据语义不同，切换模式时建议清空缓存组件，避免复用旧模式页面实例。

---

## 8. 路由 meta 需要补充的配置

当前项目已有 `RouteMetaCustomizeOpsKey.Name = 'customizeOps'`，可以继续沿用。

建议扩展：

```ts
export interface RouteMetaCustomizeOptions extends Record<string, any> {
  isIgnoreLogin?: boolean;
  isIgnoreHistory?: boolean;

  /** 不进入 tabs-bar，例如登录页 */
  hiddenTab?: boolean;
  /** 固定标签，例如首页 */
  affix?: boolean;
  /** 是否缓存页面 */
  keepAlive?: boolean;
  /** tab 图标 */
  icon?: string;
  /** 自定义 tab 标题，不配置则使用 route.meta.title */
  tabTitle?: string;
}
```

路由可这样配置：

```ts
{
  path: '/homepage-company',
  name: 'homepage-company',
  component: viewComponent.CompanyHomepage,
  meta: {
    title: '首页',
    customizeOps: {
      affix: true,
      keepAlive: true,
      icon: 'icon-home',
    },
  },
}
```

登录页建议：

```ts
{
  path: '/login',
  name: 'login',
  meta: {
    title: '登录',
    customizeOps: {
      hiddenTab: true,
      isIgnoreLogin: true,
    },
  },
}
```

---

## 9. 路由和 Tab 同步逻辑

源项目是在 `tabs-bar.vue` 内监听 `router.currentRoute`，路由变化后调用 `activationMenu()` 新增/激活 tab。

当前项目建议把这段逻辑独立成：

```txt
packages/platform/admin-vue/src/composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts
```

### 9.1 同步时机

推荐使用 `router.afterEach`：

```ts
router.afterEach(to => {
  syncRouteToTab(to);
});
```

当前 `useRouteGuard` 类型里已有 `afterEach`，但函数实现中没有注册，需要补上：

```ts
if (options?.afterEach) {
  router.afterEach(options.afterEach);
}
```

或者在路由初始化入口单独调用：

```ts
setupTabBarRouteSync(router);
```

### 9.2 同步算法

伪代码：

```ts
const syncRouteToTab = (route: RouteLocationNormalizedLoaded) => {
  const customizeOps = route.meta?.customizeOps || {};

  if (customizeOps.hiddenTab) return;
  if (route.name === 'login') return;

  const tab = createTabFromRoute(route);

  if (tab.navigationType) {
    systemModuleAccess.setNavigationType(tab.navigationType);
  }

  systemModuleAccess.addTab(tab);
  systemModuleAccess.setActiveTab(tab.fullPath);

  if (tab.keepAlive && tab.componentName) {
    systemModuleAccess.addCachedView(tab.componentName, tab.navigationType);
  }
};
```

### 9.3 从 route 生成 tab

优先级建议：

1. 从菜单树中按 `route.query.menuCode` 查找菜单，拿 `menuName` 和 `menuSvgId`。
2. 找不到菜单时使用 `route.meta.customizeOps.tabTitle`。
3. 再找不到时使用 `route.meta.title`。
4. 最后兜底使用 `route.name` 或 `route.path`。

伪代码：

```ts
const createTabFromRoute = (route: RouteLocationNormalizedLoaded): TabBarListOptions => {
  const customizeOps = route.meta?.customizeOps || {};
  const menuCode = String(route.query.menuCode || '');
  const navigationType = Number(route.query.navigationType || systemModuleAccess.state.navigationType) as MenuStatus;
  const navigationState = navigationType ? systemModuleAccess.state[navigationType] : undefined;
  const menu = findMenuByCode(navigationState?.menulist || [], menuCode);

  return {
    title: menu?.menuName || customizeOps.tabTitle || String(route.meta.title || route.name || route.path),
    path: route.fullPath,
    fullPath: route.fullPath,
    routeName: route.name ? String(route.name) : undefined,
    menuCode,
    navigationType,
    icon: menu?.menuSvgId || customizeOps.icon,
    affix: !!customizeOps.affix,
    closable: !customizeOps.affix,
    keepAlive: !!customizeOps.keepAlive,
    componentName: route.name ? String(route.name) : undefined,
  };
};
```

---

## 10. 路径比较工具

源项目有两个重要工具函数：

1. `getPath()`：把当前路由 path + query 拼成可跳转路径。
2. `isSamePath()`：比较两个路径是否一致，并忽略 query 参数顺序。

当前项目建议新增到 `tabs-bar.ts` 或单独工具文件：

```ts
export const normalizePath = (url: string) => {
  if (!url) return '';

  const [pathWithQuery, hash = ''] = url.split('#');
  const [path, query = ''] = pathWithQuery.split('?');
  const sortedQuery = query
    .split('&')
    .filter(Boolean)
    .sort()
    .join('&');

  return `${path}?${sortedQuery}${hash ? `#${hash}` : ''}`;
};

export const isSamePath = (a: string, b: string) => normalizePath(a) === normalizePath(b);
```

如果后续也支持 `shortcut`，可以增加：

```ts
export const removeQueryKeys = (url: string, keys: string[]) => {
  const [path, query = ''] = url.split('?');
  const params = new URLSearchParams(query);

  keys.forEach(key => params.delete(key));

  const paramsString = params.toString();
  return paramsString ? `${path}?${paramsString}` : path;
};
```

---

## 11. tabs-bar.vue 需要实现的 UI

### 11.1 模板结构建议

参考源项目结构，当前项目可以写成：

```vue
<template>
  <div class="tabs-bar">
    <plt-icon
      v-show="showLeft && showMoveBtns"
      icon="icon-plt-zuo_Light"
      class="tabs-bar-button"
      @click="move('left')"
    />

    <div class="tabs-bar-box">
      <div ref="tabsBarBoxRef" class="tabs-bar-list">
        <div
          v-for="(item, index) in barsList"
          :key="item.fullPath || item.path"
          :ref="el => setBarRef(el, index)"
          class="tabs-bar-item"
          :class="{ 'is-active': item.fullPath === activeTabFullPath }"
          @click="toggleBar(item)"
          @contextmenu.prevent.stop="openContextMenu($event, index)"
        >
          <span class="dot" />
          <span class="title">{{ item.title }}</span>
          <plt-icon
            v-if="item.closable !== false"
            class="close"
            icon="icon-plt-danchuang-guanbi_Light"
            @click.stop="closeBar(item)"
          />
        </div>
      </div>
    </div>

    <plt-icon
      v-show="showRight && showMoveBtns"
      icon="icon-plt-you_Light"
      class="tabs-bar-button"
      @click="move('right')"
    />

    <el-dropdown v-if="showMoveBtns" class="tabs-bar-all">
      <span class="all-tab">
        <plt-icon icon="icon-plt-xiala" />
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in barsList"
            :key="item.fullPath || item.path"
            @click="toggleBar(item)"
          >
            {{ item.title }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <ul
      v-show="contextMenuVisible"
      class="tabs-bar-panel"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
    >
      <li @mousedown="refreshCurrentTab">刷新</li>
      <li v-if="contextMenuTarget?.closable !== false" @mousedown="closeContextTab">关闭</li>
      <li @mousedown="closeOtherTabs">关闭其他</li>
      <li @mousedown="closeAllTabs">关闭所有</li>
    </ul>
  </div>
</template>
```

### 11.2 样式要点

需要实现：

1. `.tabs-bar`：横向 flex，固定高度。
2. `.tabs-bar-box`：`flex: 1; overflow: hidden; position: relative;`。
3. `.tabs-bar-list`：横向 flex，使用 `transform: translateX(...)` 移动。
4. `.tabs-bar-item`：固定不压缩 `flex-shrink: 0`。
5. `.is-active`：高亮边框、背景和文字。
6. `.close`：默认只在 hover 或 active 时显示。
7. `.tabs-bar-panel`：`position: fixed; z-index: 9999`。

---

## 12. tabs-bar.ts 需要实现的逻辑

当前 `tabs-bar.ts` 只有读取列表。需要扩展成组合式逻辑。

### 12.1 对外返回数据

建议返回：

```ts
return {
  barsList,
  activeTabFullPath,
  showLeft,
  showRight,
  showMoveBtns,
  tabsBarBoxRef,
  contextMenuVisible,
  contextMenuLeft,
  contextMenuTop,
  contextMenuTarget,
  setBarRef,
  toggleBar,
  closeBar,
  move,
  openContextMenu,
  refreshCurrentTab,
  closeContextTab,
  closeOtherTabs,
  closeAllTabs,
};
```

### 12.2 点击切换

```ts
const toggleBar = (tab: TabBarListOptions) => {
  if (tab.fullPath === route.fullPath) return;
  router.push(tab.path || tab.fullPath);
};
```

### 12.3 关闭当前 tab

```ts
const closeBar = async (tab: TabBarListOptions) => {
  if (tab.closable === false) return;

  const index = barsList.value.findIndex(item => item.fullPath === tab.fullPath);
  const isActive = tab.fullPath === activeTabFullPath.value;

  systemModuleAccess.removeTab(tab.fullPath);

  if (isActive) {
    const nextTab = barsList.value[index - 1] || barsList.value[index] || barsList.value[0];
    if (nextTab) {
      await router.push(nextTab.path || nextTab.fullPath);
    }
  }
};
```

注意：如果 `barsList` 是 store 的只读 computed，关闭前后数组引用会变化，实际实现时要先算好 `nextTab` 再 remove。

### 12.4 关闭其他

```ts
const closeOtherTabs = () => {
  const target = contextMenuTarget.value || currentActiveTab.value;
  if (!target) return;

  systemModuleAccess.closeOtherTabs(target.fullPath);
  router.push(target.path || target.fullPath);
};
```

### 12.5 关闭全部

```ts
const closeAllTabs = () => {
  systemModuleAccess.closeAllTabs();

  const navigationType = systemModuleAccess.state.navigationType;
  const firstTab = navigationType
    ? systemModuleAccess.state[navigationType].tabBarlist[0]
    : undefined;

  if (firstTab) router.push(firstTab.path || firstTab.fullPath);
};
```

---

## 13. 横向滚动逻辑

源项目是通过 DOM 宽度计算和 `transform: translateX(...)` 实现。

当前项目可以保留同样思路。

### 13.1 需要的状态

```ts
const tabsBarBoxRef = ref<HTMLElement>();
const barsRefs = ref<Record<number, HTMLElement>>({});
const showLeft = ref(false);
const showRight = ref(false);
const showMoveBtns = ref(false);
```

### 13.2 判断是否溢出

```ts
const updateMoveStatus = async () => {
  await nextTick();

  const container = tabsBarBoxRef.value;
  if (!container) return;

  const totalWidth = Object.values(barsRefs.value).reduce((sum, el) => {
    return sum + (el?.offsetWidth || 0);
  }, 0);

  showMoveBtns.value = totalWidth > container.offsetWidth;

  if (!showMoveBtns.value) {
    showLeft.value = false;
    showRight.value = false;
    container.style.transform = 'translateX(0px)';
  }
};
```

### 13.3 左右移动

```ts
const move = (type: 'left' | 'right') => {
  const container = tabsBarBoxRef.value;
  if (!container) return;

  const current = getCurrentTranslateX(container);
  const pageWidth = container.offsetWidth;
  const maxMove = getMaxMoveDistance();

  if (type === 'left') {
    const next = Math.max(current - pageWidth, 0);
    container.style.transform = `translateX(${-next}px)`;
    showLeft.value = next > 0;
    showRight.value = true;
  }

  if (type === 'right') {
    const next = Math.min(current + pageWidth, maxMove);
    container.style.transform = `translateX(${-next}px)`;
    showLeft.value = true;
    showRight.value = next < maxMove;
  }
};
```

### 13.4 激活 tab 自动滚动到可见区域

监听 `activeTabFullPath`：

```ts
watch(activeTabFullPath, () => {
  scrollActiveTabIntoView();
});
```

核心规则：

1. 当前 tab 在可视区域左侧外面：向左滚到当前 tab。
2. 当前 tab 在可视区域右侧外面：向右滚到当前 tab。
3. tab 总宽度不超出容器：还原到 `translateX(0)`。

---

## 14. 右键菜单逻辑

源项目右键菜单直接用 `ul/li` 实现，不依赖 Element Plus ContextMenu。

当前项目也可以这样写。

### 14.1 状态

```ts
const contextMenuVisible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);
const contextMenuIndex = ref(-1);
```

### 14.2 打开菜单

```ts
const openContextMenu = (event: MouseEvent, index: number) => {
  contextMenuVisible.value = true;
  contextMenuLeft.value = event.pageX + 5;
  contextMenuTop.value = event.pageY + 5;
  contextMenuIndex.value = index;
};
```

### 14.3 点击外部关闭

当前项目没有 `@vueuse/core` 依赖，建议直接用原生监听：

```ts
onMounted(() => {
  document.addEventListener('mousedown', closeContextMenu);
  window.addEventListener('resize', updateMoveStatus);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closeContextMenu);
  window.removeEventListener('resize', updateMoveStatus);
});
```

---

## 15. KeepAlive 和内容区改造

当前 `main.vue` 的内容区是：

```vue
<div class="main-container">222</div>
```

如果要实现多标签页切换页面，需要改为子路由出口。

### 15.1 不缓存版本

```vue
<div class="main-container">
  <router-view />
</div>
```

### 15.2 KeepAlive 版本

```vue
<div class="main-container">
  <router-view v-slot="{ Component, route }">
    <KeepAlive :include="cachedViewNames">
      <component :is="Component" :key="route.fullPath" />
    </KeepAlive>
  </router-view>
</div>
```

`cachedViewNames` 从 store 读取：

```ts
const systemModuleAccess = systemModuleAccessStore();
const cachedViewNames = computed(() => {
  const navigationType = systemModuleAccess.state.navigationType;
  return navigationType ? systemModuleAccess.state[navigationType].cachedViewNames : [];
});
```

> 注意：`KeepAlive include` 匹配的是组件 `name`，因此每个页面组件需要 `defineOptions({ name: 'xxx' })`，并且 `componentName` 要和组件 name 保持一致。

---

## 16. 刷新当前标签页

源项目刷新逻辑是：

1. 检查是否有记录窗口。
2. 检查当前页面校验状态。
3. 必要时弹确认框。
4. 关闭所有记录窗口。
5. 删除校验方法。
6. 发送全局广播 `RightClickRefresh`。

当前项目如果没有记录窗口和校验系统，可以先实现一个基础刷新。

### 16.1 基础刷新方案

给 main 布局加一个 `routerViewKey`：

```ts
const refreshKey = ref(0);
provide('refreshCurrentView', () => {
  refreshKey.value += 1;
});
```

内容区：

```vue
<router-view v-slot="{ Component, route }">
  <component :is="Component" :key="`${route.fullPath}-${refreshKey}`" />
</router-view>
```

Tabs Bar 中注入刷新方法：

```ts
const refreshCurrentView = inject<() => void>('refreshCurrentView');

const refreshCurrentTab = () => {
  refreshCurrentView?.();
};
```

### 16.2 KeepAlive 刷新方案

如果接入 `KeepAlive`，刷新当前页时需要：

1. 从 `cachedViewNames` 删除当前组件名。
2. `nextTick()` 后再加回来。
3. 让 `<router-view>` 重新渲染当前路由。

伪代码：

```ts
const refreshCurrentTab = async () => {
  const current = currentActiveTab.value;
  if (!current?.componentName) return;

  systemModuleAccess.removeCachedView(current.componentName, current.navigationType);
  await nextTick();
  systemModuleAccess.addCachedView(current.componentName, current.navigationType);
};
```

### 16.3 增强刷新前确认，可后续再加

如果项目未来有“页面未保存数据”需求，再新增：

```txt
packages/platform/admin-vue/src/views/layout/tabs-bar/use-before-tab-close.ts
```

能力包括：

- 页面注册 `beforeTabClose` 校验方法。
- 关闭/刷新前统一调用。
- 返回 false 时弹确认框或阻止关闭。

---

## 17. 导航模式切换与缓存清理

当前 store 已经把数据拆成：

```ts
state[MenuStatus.CompanyManagement]
state[MenuStatus.CompanyPerson]
```

所以导航模式切换不是简单替换一个菜单数组，而是要完成一组状态切换：

1. 更新 `state.navigationType`。
2. tabs-bar 改读新模式的 `tabBarlist`。
3. 侧边栏菜单改读新模式的 `menulist`。
4. `KeepAlive include` 改读新模式的 `cachedViewNames`。
5. 根据策略清空缓存组件，避免旧模式页面实例被复用。

### 17.1 推荐的 setNavigationType

建议在 `system-module-access/index.ts` 增加：

```ts
setNavigationType(
  navigationType: MenuStatus,
  options: {
    clearPreviousCachedViews?: boolean;
    clearTargetCachedViews?: boolean;
  } = {}
) {
  const previousNavigationType = state.navigationType;

  if (previousNavigationType === navigationType) return;

  if (options.clearPreviousCachedViews && previousNavigationType) {
    state[previousNavigationType].cachedViewNames = [];
  }

  if (options.clearTargetCachedViews) {
    state[navigationType].cachedViewNames = [];
  }

  state.navigationType = navigationType;
  state.activeTabFullPath = state[navigationType].tabBarlist[0]?.fullPath || '';
}
```

### 17.2 什么情况下清空缓存

建议默认策略：

| 场景 | 建议 |
| --- | --- |
| 管理模式 / 用户模式页面组件可能同名，但业务数据不同 | 切换模式时清空目标模式 `cachedViewNames` 或旧模式 `cachedViewNames` |
| 两个模式的 tab 要保留，但页面实例不要保留 | 只清空 `cachedViewNames`，不要清空 `tabBarlist` |
| 切换模式后希望完全重新开始 | 同时清空 `tabBarlist` 和 `cachedViewNames`，再初始化默认 tab |
| 只是临时隐藏另一种模式 | 不清空 `tabBarlist`，只切换 `navigationType` |

当前你提到“切换导航模式，能做到清空缓存组件数据”，推荐做成参数化能力，而不是每次强制清空：

```ts
systemModuleAccess.setNavigationType(MenuStatus.CompanyManagement, {
  clearPreviousCachedViews: true,
});
```

或者：

```ts
systemModuleAccess.setNavigationType(MenuStatus.CompanyPerson, {
  clearTargetCachedViews: true,
});
```

### 17.3 clearCachedViews action

推荐单独提供一个清空缓存 action：

```ts
clearCachedViews(navigationType = state.navigationType) {
  if (!navigationType) return;

  state[navigationType].cachedViewNames = [];
}
```

这样 tabs-bar 刷新、导航模式切换、退出登录时都可以复用。

### 17.4 KeepAlive 必须读取当前模式缓存

`main.vue` 中不要再读外层 `state.cachedViewNames`，而是读当前模式：

```ts
const cachedViewNames = computed(() => {
  const navigationType = systemModuleAccess.state.navigationType;
  return navigationType ? systemModuleAccess.state[navigationType].cachedViewNames : [];
});
```

这样 `state.navigationType` 一变，`KeepAlive include` 会切到另一组缓存列表。

### 17.5 tabs-bar 也必须读取当前模式 tabs

`tabs-bar.ts` 建议：

```ts
const barsList = computed(() => {
  const navigationType = systemModuleAccess.state.navigationType;
  return navigationType ? systemModuleAccess.state[navigationType].tabBarlist : [];
});
```

不要继续读 `state.tabBarlist`。

---

## 18. 菜单联动改造

当前 `nav.ts` 已经把菜单 URL 格式化为：

```ts
const urlParams: Record<string, string> = {
  menuCode: node.menuCode,
  navigationType: `${node.navigationType}`,
};
node.url = `${url}?${urlParamsString}`;
```

这可以作为 tab 唯一识别依据。

需要补充一个菜单查找函数：

```ts
const findMenuByCode = (menus: MenuTreeOptions[], menuCode: string): MenuTreeOptions | undefined => {
  for (const menu of menus) {
    if (menu.menuCode === menuCode) return menu;

    const child = findMenuByCode(menu.children || [], menuCode);
    if (child) return child;
  }
};
```

路由同步时用：

```ts
const navigationType = Number(route.query.navigationType || systemModuleAccess.state.navigationType) as MenuStatus;
const menu = findMenuByCode(
  navigationType ? systemModuleAccess.state[navigationType].menulist : [],
  String(route.query.menuCode || '')
);
```

这样可以保证标签标题和图标来自后端菜单，而不是只依赖路由 meta。

---

## 19. 推荐实现顺序

建议按下面顺序做，风险最低。

### 第 1 步：统一类型

改：

- `system-module-access/index.type.ts`
- `tabs-bar.type.ts`

目标：统一 `title/path/fullPath/icon/closable/affix/keepAlive/componentName`。

### 第 2 步：补 Store actions

改：

- `system-module-access/index.ts`

目标：所有 tab 增删改都通过 store 完成。

### 第 3 步：main.vue 加子路由出口

改：

- `layout/main/main.vue`

先加普通 `<router-view />`，确保点击菜单能显示子路由页面。

### 第 4 步：路由变化自动同步 tab

新增/改：

- `composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts`
- `router/tools/guard.ts` 或路由初始化入口

目标：刷新、菜单点击、浏览器前进后退都能同步标签。

### 第 5 步：实现基础 tabs-bar UI

改：

- `tabs-bar.vue`
- `tabs-bar.ts`

目标：展示、激活、点击切换、关闭当前。

### 第 6 步：加右键菜单

目标：刷新、关闭、关闭其他、关闭所有。

### 第 7 步：加横向滚动和全部下拉

目标：标签过多时和源项目一样可左右移动，也可从下拉中选择。

### 第 8 步：加 KeepAlive

目标：切换标签保留页面状态。

### 第 9 步：加刷新前确认和广播刷新，可选

如果业务需要未保存数据确认，再实现这部分。

---

## 20. 最小可落地版本代码边界

如果只想先实现“看起来和源项目一样，并能正常切换/关闭”，最小改动范围是：

1. `system-module-access/index.type.ts`
2. `system-module-access/index.ts`
3. `tabs-bar/tabs-bar.type.ts`
4. `tabs-bar/tabs-bar.ts`
5. `tabs-bar/tabs-bar.vue`
6. `layout/main/main.vue`
7. 路由同步入口一个文件

可以暂时不做：

- 关闭前校验
- 记录窗口联动
- 全局广播刷新
- 多 shell 工作区隔离
- `shortcut` 去重
- 标签持久化恢复

---

## 21. 与源项目差异和取舍

源项目有比较强的业务耦合：

- `shellId`
- `pathId`
- `shortcut`
- `OldMenu`
- `findMenuName`
- `useGlobalBroadcast`
- `useRecordWindowState`
- `useVerificationDataChanges`

当前 `admin-vue` 暂时没有这些完整基础设施，因此不建议原样复制源组件。更适合的做法是：

1. **保留 UI 和交互效果**：横向 tabs、激活态、关闭、右键菜单、滚动、下拉。
2. **替换业务标识**：用 `menuCode` 替代源项目 `pathId`。
3. **简化工作区模型**：暂不引入 `shellId`，除非后续确实有多工作区需求。
4. **刷新机制先做简单版**：先实现当前路由组件重渲染，之后再加校验/广播。
5. **把逻辑拆成 composable**：不要把源项目所有逻辑都堆在一个 `.vue` 文件里。

---

## 22. 验收标准

实现完成后至少满足：

1. 进入首页后自动出现首页 tab，且不可关闭。
2. 点击左侧菜单后：
   - 页面路由变化；
   - tab 自动新增；
   - 已存在 tab 不重复新增；
   - 当前 tab 高亮。
3. 点击 tab 可切换页面。
4. 关闭非当前 tab 不影响当前页面。
5. 关闭当前 tab 后自动跳转到相邻 tab。
6. 右键 tab 可显示菜单。
7. 右键“关闭其他”只保留首页和当前 tab。
8. 右键“关闭所有”只保留首页，并跳转首页。
9. tab 超出容器宽度时显示左右移动按钮和全部下拉。
10. 刷新浏览器后，至少能根据当前路由恢复当前 tab；如果做持久化，则恢复上次 tab 列表。
11. 如果接入 KeepAlive，切换 tab 后页面表单状态不丢失；关闭 tab 后对应缓存被清理。

---

## 23. 建议最终目录结构

```txt
packages/platform/admin-vue/src/
├── composables/
│   └── use-tab-bar-route-sync/
│       └── use-tab-bar-route-sync.ts
└── views/layout/tabs-bar/
    ├── tabs-bar.vue
    ├── tabs-bar.ts
    ├── tabs-bar.type.ts
    ├── use-tab-bar-scroll.ts
    ├── use-tab-bar-context-menu.ts
    ├── use-tab-refresh.ts
    └── tabs-bar-implementation.md
```

其中：

- `tabs-bar.vue`：只负责模板和样式。
- `tabs-bar.ts`：组装各 composable，向模板暴露状态和事件。
- `tabs-bar.type.ts`：定义 tab 类型、右键菜单类型。
- `composables/use-tab-bar-route-sync/use-tab-bar-route-sync.ts`：路由进入 tab 的逻辑。
- `use-tab-bar-scroll.ts`：横向滚动、宽度计算、resize。
- `use-tab-bar-context-menu.ts`：右键菜单状态和行为。
- `use-tab-refresh.ts`：刷新当前 tab、清理缓存、广播刷新。

---

## 24. 结论

要达到源项目同样效果，不能只改 `tabs-bar.vue`。至少需要补齐：

1. **更完整的 tab 数据模型**。
2. **store 中的标签增删改查能力**。
3. **路由变化自动同步 tab 的逻辑**。
4. **main 内容区的子路由渲染**。
5. **tabs-bar 的交互 UI**。
6. **横向滚动和右键菜单**。
7. **可选的 KeepAlive、刷新、关闭前确认能力**。

当前项目已有菜单、路由 meta、Pinia store 和布局挂载点，基础是够的。建议不要照搬源项目整个组件，而是按当前项目的数据结构和 `menuCode/navigationType` 约定，拆分成 store + route sync + UI composables 的实现。这样后续加缓存、刷新确认、多工作区时也更容易维护。
