import fs from 'fs';

/**
 * 读取全局静态资源文件名并创建动态标签
 * @param options.globalDependenciesNames - 全局依赖的 name
 * @param options.prefix - 相对路径
 * @param options.targetPath - 静态资源目录路径
 *
 * @returns - 动态标签字符串 - `<script src="/${prefix}/${fileName}"></script>`
 */
const generateScriptTags = (options: {
    globalDependenciesNames;
    prefix: string;
    targetPath: string;
}) => {
    const { globalDependenciesNames, prefix, targetPath } = options;
    try {
        // 读取静态资源文件列表
        const files = fs.readdirSync(targetPath);

        const fileNames = [];

        globalDependenciesNames?.forEach(value => {
            // 处理有版本好相关静态依赖
            const matchResult = files.find(str => str.includes(`${value}@`));
            if (matchResult) {
                fileNames.push(matchResult);
            } else {
                fileNames.push(value);
            }
        });

        // 创建动态标签
        const remoteSourceLink = fileNames
            ?.map(file => `<script src="/${prefix}/${file}"></script>`)
            .join('\n');

        return remoteSourceLink;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('无法读取静态资源文件列表:', error);
        throw error;
    }
};

export { generateScriptTags };
