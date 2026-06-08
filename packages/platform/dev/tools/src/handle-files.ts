import fs from 'fs';
import path from 'path';

/**
 * 复制文件
 * @param {*} files
 * @param {*} options
 */
export const copyFile = (options: { sourcePath: string; targetPath: string; soft: boolean }) => {
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
