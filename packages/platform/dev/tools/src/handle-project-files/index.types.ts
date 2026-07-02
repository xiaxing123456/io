export interface EnvsOptions extends Record<string, any> {
    VITE_BASE_URL?: string;
    VITE_SOCKET_URL?: string;
    VITE_LOGGER_TRIGGER?: string;
}

/**
 * 根据环境变量在目标文件夹下面生成文件，默认生成文件名是 config.js
 * @param {*} param0 evnDirPath 环境变量目录文件
 * @param {*} param1 genFileDirPath 生成文件的目录
 * @param {*} param2 genFileName 生成的文件名
 */
export type GenConfigFileForEnvType = (optioins: {
    /** 环境变量目录文件 */
    envs: EnvsOptions;
    /** 生成文件的目录 */
    genFileDirPath: string;
    /** 生成的文件名, 默认是 config.js */
    genFileName?: string;
}) => void;
