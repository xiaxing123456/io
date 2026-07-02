import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { copyDirectory, copyFile } from '../handle-files';
import type { GenConfigFileForEnvType } from './index.types';

/**
 * ## 复制指定的来源目录文件夹到指定的目录, copyDirectory 函数的包裹函数
 *  TODO 命名需要进行优化
 * @param options
 */
const gePublicFile = (options: Record<string, any>) => {
  const { sourcePath, targetPath, soft } = {
    sourcePath: '',
    targetPath: '',
    soft: false,
    ...options,
  };

  copyDirectory(sourcePath, targetPath, {
    soft,
  });
};

/**
 * ## 复制指定的来源目录文件到指定的目录, copyFile 函数的包裹函数
 * TODO 命名需要进行优化
 * @param options
 */
const geEnvFile = (options: Record<string, string>) => {
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

/**
 * ## 根据环境变量在目标文件夹下面生成文件，默认生成文件名是 config.js
 * @param {*} options
 * @param {*} options.evnDirPath 环境变量目录文件
 * @param {*} options.genFileDirPath 生成文件的目录
 * @param {*} options.genFileName 生成的文件名
 */
const genConfigFileForEnv: GenConfigFileForEnvType = options => {
  const { envs, genFileDirPath, genFileName } = { genFileName: 'config.js', ...options };
  // 创建新的config.js文件内容
  const newConfigContent = `/**
 * 此配置是提供给平台工程的
 * 为了编译打包后，在部署的时候还可以更改代理前缀、日志是否打印
 */
const proxyVariables = {
    /** 普通请求代理前缀 */
    baseUrl: '${envs?.VITE_BASE_URL || '/api'}',
    /** webscoket代理前缀 */
    socketUrl: '${envs?.VITE_SOCKET_URL || '/socketApi'}',
    /** 是否打印日志 */
    loggerTrigger: '${envs?.VITE_LOGGER_TRIGGER || 'off'}',
};
window.DMS_PIMC_PROXY = proxyVariables;
`;

  // 写入新的config.js文件
  const newConfigPath = resolve(genFileDirPath, genFileName);
  writeFileSync(newConfigPath, newConfigContent, 'utf8');

  console.log(`${genFileName} has been created with environment variables.`);
};

export { geEnvFile, genConfigFileForEnv, gePublicFile };
