export type AccessToken = null | string;

/**
 * 核心模块
 */
export interface CoreAccessState {
    /**
     * 登录 accessToken
     */
    accessToken: AccessToken;
}
