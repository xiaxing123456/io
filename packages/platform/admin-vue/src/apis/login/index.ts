import { envMicrServices } from '@admin-vue/utils/env-var';
import { reqGet, reqPost } from '@admin-vue/utils/request';

const baseUrl = envMicrServices.managerServer;
/**
 * 登录表单
 */
export interface ILoginForm {
  userName: string;
  password: string;
  captcha: string;
  codeKey: string;
}

/** 获取验证码 */
export const generateValidateCode = () => {
  return reqGet(`${baseUrl}/user/generateValidateCode`);
};

/** 登录 */
export const login = async (data: ILoginForm) => {
  return reqPost(`${baseUrl}/user/login`, data, {
    pltConfig: { cancelPrevious: true },
  });
};

/** 退出登录 */
export const logout = async (id: number) => {
  return reqGet(`${baseUrl}/user/logout/${id}`);
};
