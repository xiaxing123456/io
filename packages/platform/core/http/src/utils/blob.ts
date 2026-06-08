/**
 * @dmsplatform/http - Blob 处理工具函数
 * 提供文件流下载、Blob 转换等工具方法
 */

import type { AxiosResponse } from 'axios';

/** 文件流请求配置类型 */
export interface RequestFileStreamConfigType {
  url: string;
  method?: 'get' | 'post';
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  fileName?: string;
}

/** 下载文件流配置类型 */
export interface DownloadFileStreamConfig {
  fileName?: string;
  blobOption?: BlobPropertyBag;
}

/**
 * 判断响应是否为 Blob 类型
 * 同时检查 HTTP 状态为 200 和 responseType 为 blob
 * @param response - Axios 响应
 * @returns 是否为 Blob 响应
 */
export const isResBlob = (response: AxiosResponse): boolean => {
  return response?.status === 200 && response.config?.responseType === 'blob';
};

/**
 * 判断 Blob 响应是否为 JSON 内容
 * 优先检查 Blob.type，其次检查 Content-Type 头
 * @param response - Axios 响应
 * @returns 是否为 JSON Blob
 */
export const isJsonBlob = (response: AxiosResponse): boolean => {
  if (response?.data instanceof Blob) {
    return response.data.type === 'application/json';
  }
  const contentType = response?.headers?.['content-type'] || '';
  return contentType.includes('application/json');
};

/**
 * 判断响应是否为二进制流（octet-stream）
 * @param response - Axios 响应
 * @returns 是否为二进制流
 */
export const isOctetStream = (response: AxiosResponse): boolean => {
  const contentType = response?.headers?.['content-type'] || '';
  return contentType.includes('application/octet-stream');
};

/**
 * 将 Blob 响应转换为 JSON 对象
 * @param response - Axios 响应
 * @returns 解析后的 JSON 数据
 */
export const resBlobToJson = async (response: AxiosResponse): Promise<unknown> => {
  try {
    const blob = response.data as Blob;
    const text = await blob.text();
    return JSON.parse(text);
  } catch {
    return response.data;
  }
};

/**
 * 从响应头中提取文件名
 * @param response - Axios 响应
 * @returns 文件名，如果无法提取则返回空字符串
 */
export const extractFileName = (response: AxiosResponse): string => {
  const disposition = response.headers?.['content-disposition'] || '';

  // 尝试从 content-disposition 头提取文件名
  // 格式: attachment; filename="example.pdf" 或 attachment; filename=example.pdf
  const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);

  if (filenameMatch && filenameMatch[1]) {
    // 移除引号
    return filenameMatch[1].replace(/['"]/g, '');
  }

  return '';
};

/**
 * 下载 Blob 文件
 * @param blob - Blob 数据
 * @param fileName - 文件名
 *
 * @example
 * ```typescript
 * import { downloadBlob } from '@dmsplatform/http/utils';
 *
 * const blob = new Blob([data], { type: 'application/pdf' });
 * downloadBlob(blob, 'document.pdf');
 * ```
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const link = document.createElement('a');
  link.download = decodeURIComponent(fileName);
  link.style.display = 'none';
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // 释放 URL 对象
  URL.revokeObjectURL(link.href);
};

/**
 * 下载文件流响应
 * @param response - Axios 响应
 * @param config - 文件流配置
 *
 * @example
 * ```typescript
 * import { downloadFileStream } from '@dmsplatform/http/utils';
 *
 * const response = await http.get('/download', { responseType: 'blob' });
 * downloadFileStream(response, { fileName: 'custom-name.pdf' });
 * ```
 */
export const downloadFileStream = (
  response: AxiosResponse,
  config: DownloadFileStreamConfig = {}
): void => {
  const blob = new Blob([response.data], config.blobOption);

  // 优先使用配置的文件名，否则从响应头提取
  const fileName = config.fileName || extractFileName(response) || 'download';

  downloadBlob(blob, fileName);
};

/**
 * 创建 Blob 对象
 * @param data - 数据
 * @param options - Blob 配置选项
 * @returns Blob 对象
 */
export const createBlob = (data: BlobPart | BlobPart[], options?: BlobPropertyBag): Blob => {
  const parts = Array.isArray(data) ? data : [data];
  return new Blob(parts, options);
};

/**
 * 将 Blob 转换为 Base64 字符串
 * @param blob - Blob 对象
 * @returns Base64 字符串
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * 将 Base64 字符串转换为 Blob
 * @param base64 - Base64 字符串
 * @param mimeType - MIME 类型
 * @returns Blob 对象
 */
export const base64ToBlob = (base64: string, mimeType = 'application/octet-stream'): Blob => {
  // 移除 data URL 前缀
  const base64Data = base64.replace(/^data:[^;]+;base64,/, '');

  const byteCharacters = atob(base64Data);
  const byteArrays: any[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mimeType });
};
