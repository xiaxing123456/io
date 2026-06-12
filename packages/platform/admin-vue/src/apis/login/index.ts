import { envMicrServices } from '@admin-vue/utils/env-var';
import { reqGet, reqPost } from '@admin-vue/utils/request';

/** 登录 */
export const login = async (data: AnyObj) => {
  return reqPost(`${envMicrServices.managerServer}/user/login`, data, {
    pltConfig: { cancelPrevious: true },
  });
};

/** 获取验证码 */
export const generateValidateCode = () => {
  return reqGet(`${envMicrServices.managerServer}/user/generateValidateCode`);
};
