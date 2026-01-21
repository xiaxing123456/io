"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geEnvFile = void 0;
const handle_files_1 = require("../handle-files");
/**
 * ## 复制指定的来源目录文件到指定的目录, copyFile 函数的包裹函数
 * TODO 命名需要进行优化
 * @param options
 */
const geEnvFile = (options) => {
    const { sourcePath, targetPath, soft } = Object.assign({ sourcePath: '', targetPath: '', soft: false }, options);
    (0, handle_files_1.copyFile)({
        sourcePath,
        targetPath,
        soft,
    });
};
exports.geEnvFile = geEnvFile;
