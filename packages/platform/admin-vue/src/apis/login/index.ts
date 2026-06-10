import { envMicrServices } from '@admin-vue/utils/env-var';
import * as baseService from '@admin-vue/utils/request';
import qs from 'qs';

/** 登录 */
export const login = async (data: AnyObj, signal?: AbortSignal) => {
  return baseService.reqPost(`${envMicrServices.managerServer}/user/login`, qs.stringify(data), {
    pltConfig: { cancelRequest: true },
  });
};
