// 导入 fs 和 path 模块
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 源目录和目标目录
const sourceDir = path.resolve(__dirname, '../blog');
const targetDir = path.resolve(__dirname, '../dist/blog');

// 复制文件夹及其子文件夹中的所有图片文件到目标目录
async function traverseDirectory(source, target) {
    // 如果目标目录不存在，则创建目标目录
    if (!fs.existsSync(target)) {
        await fs.promises.mkdir(target, { recursive: true });
    }

    // 获取源目录下的所有文件
    const files = await fs.promises.readdir(source);
    for (const file of files) {
        // 拼接源文件和目标文件的路径
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        // 如果是文件夹，则递归处理子文件夹
        if ((await fs.promises.stat(sourcePath)).isDirectory()) {
            await traverseDirectory(sourcePath, targetPath);
        } else {
            // 如果是图片文件，则复制到目标目录
            if (isImageFile(file)) {
                await fs.promises.copyFile(sourcePath, targetPath);
            }
        }
    }
}

// 判断文件是否为图片文件
function isImageFile(fileName) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
    const ext = path.extname(fileName).toLowerCase();
    return imageExtensions.includes(ext);
}

// 执行
traverseDirectory(sourceDir, targetDir).catch(console.error);
