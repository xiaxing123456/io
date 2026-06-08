import { InjectionKey, Ref, ComputedRef } from 'vue';

export type RouterRefresh = () => void;
export type ArgeFunc = (...arge: any[]) => void;

export const RouterRefreshKey: InjectionKey<RouterRefresh> =
    'PltRouterRefreshKey' as unknown as symbol;
export const RouterRefreshHomePage: InjectionKey<RouterRefresh> =
    'PltRouterRefreshHomePage' as unknown as symbol;
export const SaveOldMenu: InjectionKey<ArgeFunc> = 'PltSaveOldMenu' as unknown as symbol;

// 用于：级联菜单组件
export const CascaderChange: InjectionKey<ArgeFunc> = 'PltCascaderChange' as unknown as symbol;
// 用于：右键菜单组件位置
export const RightMenusLeft: InjectionKey<Ref<number>> = 'PltRightMenusLeft' as unknown as symbol;
export const RightMenusTop: InjectionKey<Ref<number>> = 'PltRightMenusTop' as unknown as symbol;
/**
 *  用于：传递当前表单来源（1-外壳 2-bp 3-文档 4-用户管理）
 * */
export const FormSourceType: InjectionKey<number> = 'PltFormSourceType' as unknown as symbol;
// 用于：用户管理表单
export const UserFixedForm: InjectionKey<Ref<AnyObj>> = 'PltUserFixedForm' as unknown as symbol;
// 用于：功能设计-自动创建页面
export const CreateNotHandle: InjectionKey<ComputedRef<boolean>> =
    'PltCreateNotHandle' as unknown as symbol;
// 用于：打印样式页面
export const PrintDisabled: InjectionKey<boolean> = 'PltPrintDisabled' as unknown as symbol;

// 用于：业务流程设置
export const BpSetupRowData: InjectionKey<Ref<AnyObj>> = 'PltBpSetupRowData' as unknown as symbol;
export const BpSetupRowsData: InjectionKey<Ref<AnyObj[]>> =
    'PltBpSetupRowsData' as unknown as symbol;
export const BpSetupIsShowDetail: InjectionKey<Ref<boolean>> =
    'PltBpSetupIsShowDetail' as unknown as symbol;
export const BpSetupIsShowDetailNoworkFlow: InjectionKey<Ref<boolean>> =
    'PltBpSetupIsShowDetailNoworkFlow' as unknown as symbol;
export const BpSetupSideRowData: InjectionKey<Ref<AnyObj>> =
    'PltBpSetupSideRowData' as unknown as symbol;
export const BpSetupIsUpdateSide: InjectionKey<Ref<boolean>> =
    'PltBpSetupIsUpdateSide' as unknown as symbol;
export const BpSetupSidePluginTabConfig: InjectionKey<Ref<AnyObj[]>> =
    'PltBpSetupSidePluginTabConfig' as unknown as symbol;

// 用于：业务流程设置-工作流策略
export const BpSetupIsShowMask: InjectionKey<Ref<boolean>> =
    'PltBpSetupIsShowMask' as unknown as symbol;
export const BpSetupForm: InjectionKey<Ref<AnyObj>> = 'PltBpSetupForm' as unknown as symbol;
export const BpSetupPolicyDetailVo: InjectionKey<Ref<AnyObj>> =
    'PltBpSetupPolicyDetailVo' as unknown as symbol;
export const BpSetupModelsData: InjectionKey<Ref<AnyObj[]>> =
    'PltBpSetupModelsData' as unknown as symbol;
export const BpSetupFlowChartMsg: InjectionKey<Ref<AnyObj>> =
    'PltBpSetupFlowChartMsg' as unknown as symbol;
export const BpSetupPluginTabCompUrlList: InjectionKey<Ref<AnyObj>> =
    'PltBpSetupPluginTabCompUrlList' as unknown as symbol;

// 用于：业务流程设置-发起创建
export const InitiateOrReceiveIsEdit: InjectionKey<Ref<boolean>> =
    'PltInitiateOrReceiveIsEdit' as unknown as symbol;
export const InitiateCurrElement: InjectionKey<Ref<AnyObj | undefined>> =
    'PltInitiateCurrElement' as unknown as symbol;
export const InitiateCurrDataJsonItem: InjectionKey<Ref<AnyObj>> =
    'PltInitiateCurrDataJsonItem' as unknown as symbol;

// 用于：文档用户使用
export const DocQueryParams: InjectionKey<Ref<AnyObj>> = 'PltDocQueryParams' as unknown as symbol;
export const DocTreeList: InjectionKey<Ref<AnyObj[]>> = 'PltDocTreeList' as unknown as symbol;
export const DocIsChangeField: InjectionKey<Ref<boolean>> =
    'PltDocIsChangeField' as unknown as symbol;
export const DocIsErrorField: InjectionKey<Ref<boolean>> =
    'PltDocIsErrorField' as unknown as symbol;
export const DocIsSaveField: InjectionKey<Ref<boolean>> = 'PltDocIsSaveField' as unknown as symbol;
export const DocIsHideSide: InjectionKey<Ref<boolean>> = 'PltDocIsHideSide' as unknown as symbol;
export const DocSideIsSave: InjectionKey<Ref<boolean>> = 'PltDocSideIsSave' as unknown as symbol;
export const DocSelectionRow: InjectionKey<Ref<AnyObj>> = 'PltDocSelectionRow' as unknown as symbol;
export const DocSelectionRows: InjectionKey<Ref<AnyObj[]>> =
    'PltDocSelectionRows' as unknown as symbol;
export const DocNodeSelection: InjectionKey<Ref<AnyObj | undefined>> =
    'PltDocNodeSelection' as unknown as symbol;
export const DocBpDataSelect: InjectionKey<Ref<AnyObj>> = 'PltDocBpDataSelect' as unknown as symbol;
export const DocRightSelection: InjectionKey<Ref<AnyObj[]>> =
    'PltDocRightSelection' as unknown as symbol;
export const DocMenuType: InjectionKey<Ref<number>> = 'PltDocMenuType' as unknown as symbol;
export const DocIsColumnBp: InjectionKey<Ref<boolean>> = 'PltDocIsColumnBp' as unknown as symbol;
export const DocRenameList: InjectionKey<Ref<AnyObj[]>> = 'PltDocRenameList' as unknown as symbol;
export const DocFieldData: InjectionKey<Ref<AnyObj>> = 'PltDocFieldData' as unknown as symbol;

// 用于：表单设计
export const FormsQueryParams: InjectionKey<Ref<AnyObj>> =
    'PltFormsQueryParams' as unknown as symbol;
export const FormsDetailData: InjectionKey<Ref<AnyObj>> = 'PltFormsDetailData' as unknown as symbol;
export const FormsIsComplete: InjectionKey<Ref<boolean>> =
    'PltFormsIsComplete' as unknown as symbol;

// 用于：全局上传，右上角上传文件列表
export const UploadIsShowUploadList: InjectionKey<Ref<boolean>> =
    'PltUploadIsShowUploadList' as unknown as symbol;
export const UploadGlobalUploadList: InjectionKey<Ref<AnyObj[]>> =
    'PltUploadGlobalUploadList' as unknown as symbol;

// 用于：BP使用，传递上传文件的时间
export const BpUploadTimestamp: InjectionKey<Ref<any>> =
    'PltBpUploadTimestamp' as unknown as symbol;

// 用于：是否为无工作流业务流程
export const IsNoWorkflow: InjectionKey<Ref<any>> = 'PltBpIsNoWorkflow' as unknown as symbol;

// 用于：BP使用，传递当前外壳状态
export const BpShellValid: InjectionKey<Ref<boolean>> = 'PltBpShellValid' as unknown as symbol;

// 用于：通知窗口，点击更多，切换左侧菜单显隐
export const ShowChangeModelBtn: InjectionKey<Ref<boolean>> =
    'PltShowChangeModelBtn' as unknown as symbol;

// 用于：查询项设计，行数据
export const QueryItemRowData: InjectionKey<Ref<AnyObj>> =
    'PltQueryItemRowData' as unknown as symbol;
// 用于：查询项设计，是否有操作权限
export const QueryItemHasPerm: InjectionKey<Ref<boolean>> =
    'PltQueryItemHasPerm' as unknown as symbol;
// 用于：动态数据集
export const DynamicDataRow: InjectionKey<Ref<any>> = 'PltDynamicDataRow' as unknown as symbol;
export const DynamicDataEntity: InjectionKey<Ref<any>> =
    'PltDynamicDataEntity' as unknown as symbol;
// 用于：仅查看权限时查看详情
export const IsEdit: InjectionKey<Ref<boolean>> = 'PltIsEdit' as unknown as symbol;

// 用于：bp操作的切换查询项的tab栏
export const ChangeQueryItemTab: InjectionKey<any> = 'PltChangeQueryItemTab' as unknown as symbol;
// 用于：bp操作的主表数据状态更新
export const ChangeMainUpdate: InjectionKey<any> = 'PltChangeMainUpdate' as unknown as symbol;
// 用于：bp操作的主表 input 输入框更新（包含数据选择器的点击清空）
export const InputMainUpdate: InjectionKey<any> = 'PltInputMainUpdate' as unknown as symbol;
// 用于：批量引用的loading
export const ItemLoading: InjectionKey<any> = 'PltItemLoading' as unknown as symbol;
// 用于：子表的方法集合
export const MinorUtils: InjectionKey<any> = 'PltMinorUtils' as unknown as symbol;
// 用于：子表的数据集合
export const FinalMinorData: InjectionKey<any> = 'PltFinalMinorData' as unknown as symbol;
// 用于：主表表单填充后动态数据集中行为级的访问方式修改
export const ChangeAccessMode: InjectionKey<any> = 'PltChangeAccessMode' as unknown as symbol;
// 用于：点击超链接时，查询链接数据的方法
export const QueryPickerLinkData: InjectionKey<any> = 'PltQueryPickerLinkData' as unknown as symbol;
// 用于：bp表单组件标记 所处位置（是否在插件里面使用）
export const FormCurrentPosition: InjectionKey<any> = 'PltFormCurrentPosition' as unknown as symbol;

// 用于：配置包管理 配置项是否有管理权限
export const ConfigItemHasPerm: InjectionKey<Ref<boolean>> =
    'PltConfigItemHasPerm' as unknown as symbol;

// 用于：菜单拖拽时的遮罩
export const ShowMask: InjectionKey<Ref<boolean>> = 'PltShowMask' as unknown as symbol;
// 用于:是否为点击切换路由的情况
export const IsClickMenu: InjectionKey<Ref<boolean>> = 'PltIsClickMenu' as unknown as symbol;

/** 用于: bp使用 tab页组件ref传递 */
export const TabComponentRef: InjectionKey<AnyObj> = 'PltBpTabComponentRef' as unknown as symbol;
