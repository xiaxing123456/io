/**
 * 核心层枚举定义
 */

/** HTTP 状态码 */
export enum HttpStatusCode {
  /** 请求成功 */
  Ok = 200,
  /** 新创建的资源已创建 */
  Created = 201,
  /** 资源已存在 */
  NoContent = 204,
  /** 请求参数错误 */
  BadRequest = 400,
  /** 未授权 */
  Unauthorized = 401,
  /** 禁止访问 */
  Forbidden = 403,
  /** 资源未找到 */
  NotFound = 404,
  /** 方法不允许 */
  MethodNotAllowed = 405,
  /** 请求超时 */
  RequestTimeout = 408,
  /** 内部服务器错误 */
  InternalServerError = 500,
  /** 服务不可用 */
  ServiceUnavailable = 503,
}

/** HTTP 请求方法 */
export enum HttpMethodEnum {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
  Patch = 'patch',
}

/** Content-Type */
export enum ContentTypeEnum {
  Json = 'application/json',
  FormUrlencoded = 'application/x-www-form-urlencoded',
  MultipartFormData = 'multipart/form-data',
  OctetStream = 'application/octet-stream',
}
