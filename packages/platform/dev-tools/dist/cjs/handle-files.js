"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * 复制文件
 * @param {*} files
 * @param {*} options
 */
const copyFile = (options) => {
    const { sourcePath, targetPath, soft } = Object.assign({ soft: false }, options);
    const envFiles = fs_1.default.readdirSync(sourcePath);
    try {
        envFiles.forEach(file => {
            if (file !== '.svn' && fs_1.default.lstatSync(path_1.default.join(sourcePath, file)).isFile()) {
                /** 目标文件 */
                const destinationFile = path_1.default.join(targetPath, file);
                if (soft && fs_1.default.existsSync(destinationFile)) {
                    console.log(`File ${destinationFile} already exists. Skipping copy.`);
                }
                else {
                    fs_1.default.copyFileSync(path_1.default.join(sourcePath, file), path_1.default.join(targetPath, file));
                }
            }
        });
    }
    catch (error) {
        console.error(error);
    }
};
exports.copyFile = copyFile;
