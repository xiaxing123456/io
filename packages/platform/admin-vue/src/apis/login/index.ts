import { envMicrServices } from '@admin-vue/utils/env-var';
import { reqGet, reqPost } from '@admin-vue/utils/request';
import qs from 'qs';

/** 登录 */
export const login = async (data: AnyObj) => {
  return reqPost(`${envMicrServices.managerServer}/user/login`, qs.stringify(data), {
    pltConfig: { cancelPrevious: true },
  });
};

/** 获取验证码 */
export const generateValidateCode = (data: AnyObj) => {
  return reqGet(`${envMicrServices.managerServer}/user/generateValidateCode`);
};
