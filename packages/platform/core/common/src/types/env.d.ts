declare global {
    /** # 环境变量类型 */
    interface ImportMetaEnv {
        VITE_BASE_URL: string;
        VITE_BASE_MOCK: string;
        VITE_SOCKET_URL: string;
        VITE_USE_LOGGER: string;

        /** ## 工作流服务 */
        VITE_WORKFLOW_SERVER: string;
        /** ## 登录服务 */
        VITE_LOGIN_SERVER: string;
        /** ## 用户安全服务 */
        VITE_SECURITY_SERVER: string;
        /** ## 日志服务 */
        VITE_AUDIT_SERVER: string;
        VITE_TEST_SERVER: string;
        /** ## 授权 */
        VITE_LICENSE_SERVER: string;
        /** ## 文件服务 */
        VITE_FILEMANAGER_SERVER: string;
        /** ## websocket服务 */
        VITE_WEBSOCKET_SERVER: string;
        /** ## 插件服务 */
        VITE_PLUGIN_SERVER: string;
    }
}

export {};
