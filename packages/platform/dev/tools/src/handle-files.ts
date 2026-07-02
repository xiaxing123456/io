import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import fsExtra from 'fs-extra';

/**
 * 复制文件
 * @param {*} files
 * @param {*} options
 */
const copyFile = (options: { sourcePath: string; targetPath: string; soft: boolean }) => {
    const { sourcePath, targetPath, soft } = {
        soft: false,
        ...options,
    };
    const envFiles = fs.readdirSync(sourcePath);
    try {
        envFiles.forEach(file => {
            if (file !== '.svn' && fs.lstatSync(path.join(sourcePath, file)).isFile()) {
                /** 目标文件 */
                const destinationFile = path.join(targetPath, file);
                if (soft && fs.existsSync(destinationFile)) {
                    console.log(`File ${destinationFile} already exists. Skipping copy.`);
                } else {
                    fs.copyFileSync(path.join(sourcePath, file), path.join(targetPath, file));
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
};

const copyFiles = async (source: string, destination: string) => {
    try {
        await fsExtra.ensureDir(destination);

        await fsExtra.copy(source, destination);

        console.log(`Folder copied successfully: ${source}`);
    } catch (error) {
        console.error(`Error reading folder: ${error.message}`);
    }
};

/**
 * 复制文件夹
 * @param {string} sourceDir 源目录
 * @param {string} targetDir 目标目录(没有目录会进行创建)
 * @param {object} options
 * @param {string} options.hasRandomFileName 是否需要添加动态文件参数
 * @param {string} options.randomSplitSymbol 文件名分隔符
 * @param {string} options.soft 软复制，不进行文件覆盖
 */
const copyDirectory = (sourceDir: string, targetDir: string, options: Record<string, any>) => {
    const { hasRandomFileName, randomSplitSymbol, soft } = {
        hasRandomFileName: false,
        randomSplitSymbol: '.',
        soft: false,
        ...options,
    };

    try {
        // 判断是否有此目录
        if (fs.existsSync(targetDir) === false) {
            fs.mkdirSync(targetDir);
        }

        // 读取源目录所有的文件/文件夹
        const dirs = fs.readdirSync(sourceDir);

        dirs.forEach(file => {
            const itemPath = path.join(sourceDir, file);
            /** 目标文件 */
            const destinationFile = path.join(targetDir, file);

            // 文件类型
            const temp = fs.statSync(itemPath);

            // 是文件
            if (temp.isFile()) {
                let fileName = file;

                // 不覆盖配置，已存同名文件则跳过
                if (soft && fs.existsSync(destinationFile)) {
                    // console.log(`File ${destinationFile} already exists. Skipping copy.`);
                } else {
                    // 对文件名前面添加随机数
                    if (hasRandomFileName) {
                        const randomPart = crypto.randomBytes(4).toString('hex');
                        // 获取源文件的文件名和扩展名
                        const { name, ext } = path.parse(file);
                        // 构建新的文件名
                        fileName = `${randomPart}${randomSplitSymbol}${name}${ext}`;
                    }

                    fs.copyFileSync(itemPath, path.join(targetDir, fileName));
                }
            } else if (temp.isDirectory()) {
                // 是目录, 进行递归复制
                copyDirectory(itemPath, path.join(targetDir, file), options);
            }
        });
    } catch (error) {
        console.error('复制失败', error);
    }
};

const deleteFolder = async (folderPath: string) => {
    try {
        await fsExtra.remove(folderPath);

        console.log(`Folder deleted successfully: ${folderPath}`);
    } catch (error) {
        console.error(`Error deleting folder: ${error.message}`);
    }
};

export { copyFile, copyFiles, copyDirectory, deleteFolder };
