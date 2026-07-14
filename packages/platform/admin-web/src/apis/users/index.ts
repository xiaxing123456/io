import { envMicrServices } from '@admin-web/utils/env-var';
import { reqGet, reqPost } from '@admin-web/utils/request';
import { LoginDto, LoginVo } from './index.type';

const baseUrl = envMicrServices.managerServer;

/** 获取验证码 */
export const generateValidateCode = () => {
  return reqGet(`${baseUrl}/user/generateValidateCode`);
};

/** 登录 */
export const login = async (params: LoginDto): Promise<{ data: LoginVo }> => {
  return reqPost(`${baseUrl}/user/login`, params, {
    pltConfig: { cancelPrevious: true },
  });
};

export const currentUserMenu = () => {
  return reqGet(`${baseUrl}/sys/navMenu/currentUserMenu`);
};
