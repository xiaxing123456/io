/**
 * Request 模块入口
 * 基于 @dmsplatform/http 提供统一的 HTTP 请求方法
 */
import {
  createRequestMethods,
  downloadBlob,
  extractFileName,
  isOctetStream,
  isResBlob,
  resBlobToJson,
} from '@io-platform/core-http';

import http from '@admin-vue/utils/request/request';

// ==================== 创建请求方法 ====================

const requestMethods = createRequestMethods(http);

// ==================== 核心请求方法 ====================

export const { reqGet } = requestMethods;
export const { reqPost } = requestMethods;
export const { reqPut } = requestMethods;
export const { reqDelete } = requestMethods;

// ==================== 文件上传 ====================

export const { reqUpload } = requestMethods;

/** @deprecated 使用 reqUpload */
export const reqtUpload = requestMethods.reqUpload;

// ==================== 文件流下载 ====================

export const { reqGetFileStream } = requestMethods;
export const { reqPostFileStream } = requestMethods;
export const { reqGetBlobStream } = requestMethods;
export const { reqPostBlobStream } = requestMethods;

// ==================== Form 表单下载 ====================

/**
 * form表单获取文件 - get 请求 (有鉴权慎用)
 * @param url
 * @param data	参数 - 对象格式
 * @param config - config.hideToast 是否隐藏提示信息
 */
export const reqGetFileForForm = http.reqGetFileForForm as NonNullable<
  typeof http.reqGetFileForForm
>;

/**
 * form表单获取文件 - post 请求
 * @param url
 * @param data	参数 - 对象格式
 * @param config - config.hideToast 是否隐藏提示信息
 */
export const reqPostFileForForm = http.reqPostFileForForm as NonNullable<
  typeof http.reqPostFileForForm
>;

// ==================== 类型导出 ====================

// ==================== 工具方法导出 ====================

export { downloadBlob, extractFileName, isOctetStream, isResBlob, resBlobToJson };

// ==================== HTTP 实例导出 ====================

export { default as http } from '@admin-vue/utils/request/request';
