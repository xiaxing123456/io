import fs from 'fs';
import path from 'path';
/**
 * 复制文件
 * @param {string} source - 源文件路径
 * @param {string} target - 目标文件路径
 * @returns {Promise<void>}
 */
const copyFile = async (source: string, target: string) => {
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(target);
    readStream.pipe(writeStream);
    await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
        readStream.on('error', reject);
    });
};

/**
 * 创建目录，确保目标路径的父目录存在
 * @param {string} targetPath - 目标路径
 * @returns {Promise<void>}
 */
const createParentDirectory = async (targetPath: string) => {
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
        try {
            await fs.promises.mkdir(parentDir, { recursive: true });
        } catch (err) {
            throw new Error(`Error creating directory: ${err}`);
        }
    }
};

/**
 * 确保文件夹存在，不存在则创建
 * @param {string} dirPath - 文件夹路径
 * @returns {Promise<void>}
 */
const ensureDirectoryExists = async (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (err) {
            throw new Error(`Error creating directory: ${err}`);
        }
    }
};

/**
 * 复制函数，支持文件或文件夹重命名
 * @param {string} sourcePath - 源路径
 * @param {string} targetPath - 目标路径
 * @param {string} newName - 新名称
 * @returns {Promise<void>}
 */
const copyFileOrDirectory = async (sourcePath: string, targetPath: string, newName: string) => {
    try {
        const sourceStats = await fs.promises.stat(sourcePath);
        const targetStats = await fs.promises.stat(targetPath);

        if (targetStats.isDirectory()) {
            const fileName = newName || path.basename(sourcePath);
            const targetFilePath = path.join(targetPath, fileName);

            await createParentDirectory(targetFilePath);

            if (sourceStats.isFile()) {
                await copyFile(sourcePath, targetFilePath);
            } else if (sourceStats.isDirectory()) {
                const targetDirPath = newName ? path.dirname(targetFilePath) : targetFilePath;
                await ensureDirectoryExists(targetDirPath);
                const files = await fs.promises.readdir(sourcePath);
                files?.forEach(async file => {
                    const filePath = path.join(sourcePath, file);
                    await copyFileOrDirectory(filePath, targetFilePath, newName);
                });
            }
        } else {
            const targetFile = newName ? path.join(path.dirname(targetPath), newName) : targetPath;

            await createParentDirectory(targetFile);
            await copyFile(sourcePath, targetFile);
        }
        // eslint-disable-next-line no-console
        console.log(`${path.basename(sourcePath)} 复制成功！`);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`${path.basename(sourcePath)} 复制出错：`, error);
    }
};

/**
 * 将指定字段从源 xxx.json 同步到目标文件
 * @param {string} sourceJsonPath - 源 xxxx.json 路径
 * @param {string} targetDir - 目标文件夹路径
 * @param {string} field - 指定字段
 * @param {string} targetFileName - 目标文件名
 */
const syncFieldJSonToTarget = (options: {
    sourceJsonPath: string;
    targetDir: string;
    sourceField: string;
    targetField: string;
    targetFileName: string;
}) => {
    const { sourceJsonPath, targetDir, sourceField, targetField, targetFileName } = options;
    try {
        const sourceJson = fs.readFileSync(sourceJsonPath, 'utf8');
        const packageJson = JSON.parse(sourceJson);
        const targetFilePath = path.join(targetDir, targetFileName);
        let targetJson = {};
        if (fs.existsSync(targetFilePath)) {
            const targetContent = fs.readFileSync(targetFilePath, 'utf8');
            targetJson = JSON.parse(targetContent);
        }
        targetJson[targetField] = packageJson[sourceField];
        fs.writeFileSync(targetFilePath, JSON.stringify(targetJson, null, 4));
        // eslint-disable-next-line no-console
        console.log(
            `成功将 ${sourceJsonPath} 中的 ${sourceField} 同步到 ${targetFilePath} 中的 ${targetField}`
        );
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('同步出错:', error);
    }
};

export { copyFileOrDirectory, syncFieldJSonToTarget };
