import { copyFile } from '../handle-files';

/**
 * ## 复制指定的来源目录文件到指定的目录, copyFile 函数的包裹函数
 * TODO 命名需要进行优化
 * @param options
 */
export const geEnvFile = (options: Record<string, string>) => {
    const { sourcePath, targetPath, soft } = {
        sourcePath: '',
        targetPath: '',
        soft: false,
        ...options,
    };

    copyFile({
        sourcePath,
        targetPath,
        soft,
    });
};
