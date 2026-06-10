import { AxiosResponse } from 'axios';
import { downloadBlob } from '../utils';
import { AjaxConfigOptions, FileStreamConfig, HttpClient } from './core.types';

export const createRequestMethods = (http: HttpClient) => {
  /**
   * get 请求
   * @param url 地址
   * @param params 参数
   * @param config 配置信息
   */
  const reqGet = async <T = any>(
    url: string,
    params?: any,
    config: AjaxConfigOptions = {}
  ): Promise<T> => {
    try {
      const res = await http.get(url, { params, ...config });
      if (config?.pltConfig?.resBaseData) return res as T;
      return typeof res?.data !== 'undefined' && res.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * post 请求 - default: json, 使用 application/x-www-form-urlencoded 请用 Qs.stringify(data)
   * @param url 地址
   * @param data 参数
   * @param config 配置信息
   */
  const reqPost = async <T = any>(
    url: string,
    data?: any,
    config: AjaxConfigOptions = {}
  ): Promise<T> => {
    try {
      const res = await http({
        method: 'post',
        url,
        data,
        ...config,
      });
      if (config?.pltConfig?.resBaseData) return res as T;
      return typeof res.data !== 'undefined' && res.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * put 请求 - default: json, 使用 application/x-www-form-urlencoded 请用 Qs.stringify(data)
   * @param url 地址
   * @param data 参数
   * @param config 配置信息
   */
  const reqPut = async <T = any>(
    url: string,
    data?: any,
    config: AjaxConfigOptions = {}
  ): Promise<T> => {
    try {
      const res = await http({
        method: 'put',
        url,
        data,
        ...config,
      });
      if (config?.pltConfig?.resBaseData) return res as T;
      return typeof res.data !== 'undefined' && res.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * delete 请求
   * @param url 地址
   * @param params 参数 - body 传参使用 config: { data }
   * @param config 配置信息
   */
  const reqDelete = async <T = any>(
    url: string,
    params?: any,
    config: AjaxConfigOptions = {}
  ): Promise<T> => {
    try {
      const res = await http.delete(url, { params, ...config });
      if (config?.pltConfig?.resBaseData) return res as T;
      return typeof res.data !== 'undefined' && res.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * 文件上传
   * post请求
   * 格式: multipart/form-data
   * @param url api
   * @param data 传参
   * @param config axios config 和自定义配置
   */
  const reqUpload = async <T = any>(
    url: string,
    data: {
      fileName: string;
      fileList: any[];
      options?: Record<string, any>;
    },
    config: AjaxConfigOptions = {}
  ): Promise<T> => {
    config.headers = {
      'Content-Type': 'multipart/form-data;',
      ...config.headers,
    };

    const { fileName, fileList, options } = data;
    const formData = new FormData();

    fileList.forEach(file => {
      formData.append(fileName, file);
    });

    if (options) {
      Object.keys(options).forEach(option => {
        formData.append(option, options[option]);
      });
    }

    try {
      const res = await http.post(url, formData, config);
      return typeof res.data !== 'undefined' && res.data;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /** 生成文件流下载方法 */
  const createFileStreamHandler = (method: 'get' | 'post') => {
    return async (url: string, params?: any, config: FileStreamConfig = {}): Promise<void> => {
      const $_config: AjaxConfigOptions = {
        responseType: 'blob',
        ...config,
      };

      const reqHandleFn = method === 'post' ? reqPost : reqGet;

      try {
        const res = (await reqHandleFn(url, params, {
          pltConfig: { resBaseData: true },
          ...$_config,
        })) as AxiosResponse;
        const blob = new Blob([res.data], config.blobOption);
        const fileName =
          config?.fileName ??
          res.headers?.['content-disposition']
            ?.split(';')[1]
            ?.split('filename=')[1]
            ?.replace(new RegExp('"', 'g'), '') ??
          '';
        downloadBlob(blob, decodeURIComponent(fileName));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };
  };

  /** 生成获取Blob方法 */
  const createBlobStreamHandler = (method: 'get' | 'post') => {
    return async (
      url: string,
      params?: any,
      config: FileStreamConfig = {}
    ): Promise<Blob | null> => {
      const $_config: AjaxConfigOptions = {
        responseType: 'blob',
        ...config,
      };

      const reqHandleFn = method === 'post' ? reqPost : reqGet;
      let resData: Blob | null = null;

      try {
        const res = (await reqHandleFn(url, params, {
          pltConfig: { resBaseData: true },
          ...$_config,
        })) as AxiosResponse;
        resData = new Blob([res.data], config.blobOption);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
      return resData;
    };
  };

  /**
   * 获取文件流 - get 请求
   */
  const reqGetFileStream = createFileStreamHandler('get');

  /**
   * 获取文件流 - post 请求
   */
  const reqPostFileStream = createFileStreamHandler('post');

  /**
   * 获取文件流 blob - get 请求
   */
  const reqGetBlobStream = createBlobStreamHandler('get');

  /**
   * 获取文件流 blob - post 请求
   */
  const reqPostBlobStream = createBlobStreamHandler('post');

  return {
    reqGet,
    reqPost,
    reqPut,
    reqDelete,
    reqUpload,
    reqGetFileStream,
    reqPostFileStream,
    reqGetBlobStream,
    reqPostBlobStream,
  };
};
