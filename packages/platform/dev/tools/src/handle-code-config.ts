// 主要作用是把目前工程对应的配置提出来，分别放在两个不同的包下面，作为一个标准配置、依赖集合包，供其他工程单独依赖这些包。
// 作为单独的依赖集合，供项目定制开发、插件开发依赖，减少项目、插件维护第三方依赖的工作
// 包含 eslint 配置、tsconfig 配置、第三方依赖的 patch 补丁文件等等

import path from 'path';
import fs from 'fs';
import * as handleFile from './copy-directory-plus';

const getFilesToCopy = (rootPath: string) => {
    return [
        {
            source: path.resolve(rootPath, '.eslintignore'),
            target: path.resolve(rootPath, 'packages/platform-dev-dependencies/eslint'),
        },
        {
            source: path.resolve(rootPath, '.eslintrc.js'),
            target: path.resolve(
                rootPath,
                'packages/platform-dev-dependencies/eslint-config-engine'
            ),
            newName: 'index.js',
        },
        // {
        //     source: path.resolve(rootPath, '.prettierrc'),
        //     target: path.resolve(rootPath, 'packages/platform-dev-dependencies/prettier'),
        //     newName: '.prettierrc.js',
        // },
        {
            source: path.resolve(rootPath, 'tsconfig.json'),
            target: path.resolve(rootPath, 'packages/platform-dev-dependencies/tsconfig'),
        },
        {
            source: path.resolve(rootPath, 'patches'),
            target: path.resolve(rootPath, 'packages/platform-dependencies'),
        },
        {
            source: path.resolve(rootPath, 'patches'),
            target: path.resolve(rootPath, 'packages/platform-dev-dependencies'),
        },
    ];
};

/**
 * 过滤掉工作区范围的依赖
 *
 * 此函数接收一个对象，该对象包含依赖包名依赖版本号此函数的目的是
 * 过滤掉那些版本号以 'workspace:' 开头的依赖，也就是工作区范围的依赖
 * 这在某些情况下很有用，比如当你需要处理非工作区的依赖时
 *
 * @param deps 一个键值对对象，其中键是依赖包名，值是依赖的版本号
 * @returns 返回一个新的对象，其中移除了工作区范围的依赖
 */
const filterWorkspaceDeps = (deps: Record<string, string>) => {
    // 使用 Object.entries 将 deps 对象转换为键值对数组，然后使用 filter 方法
    // 过滤掉那些版本号以 'workspace:' 开头的依赖，最后使用 Object.fromEntries
    // 将过滤后的键值对数组转换回对象
    return Object.fromEntries(
        Object.entries(deps).filter(([, version]) => !/^workspace:/.test(version))
    );
};

/**
 * 将给定的JSON对象写入到一个临时文件中，并返回该临时文件的路径
 * 此函数用于创建一个临时的JSON文件，文件名基于当前时间戳生成，以确保唯一性
 * 主要用途是保存程序运行时的临时数据，或在不同进程或组件之间传递数据
 *
 * @param jsonObj 一个键值对对象，表示要写入临时文件的JSON数据
 * @returns 返回临时文件的路径字符串
 */
const writeTempJson = (jsonObj: Record<string, unknown>, rootPath: string): string => {
    const tmpDir = path.join(rootPath, '.tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    const tempPath = path.join(tmpDir, `temp-package-${Date.now()}-${Math.random()}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(jsonObj, null, 4));
    return tempPath;
};
/**
 * TODO handleCodeConfig 改名，使之更符合处理的功能
 * @param rootPath
 */
const handleCodeConfig = (rootPath: string) => {
    const filesToCopy = getFilesToCopy(rootPath);
    filesToCopy.forEach(({ source, target, newName }) => {
        handleFile.copyFileOrDirectory(source, target, newName);
    });

    const sourcePackageJsonPath = path.resolve(rootPath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(sourcePackageJsonPath, 'utf-8'));

    // 过滤 dependencies 里的 workspace:* 依赖
    const filteredDependencies = filterWorkspaceDeps(pkgJson.dependencies || {});
    // 过滤 devDependencies 里的 workspace:* 依赖
    const filteredDevDependencies = filterWorkspaceDeps(pkgJson.devDependencies || {});

    // 写入项目本地 .tmp 文件夹
    const tempDepPath = writeTempJson({ dependencies: filteredDependencies }, rootPath);
    const tempDevDepPath = writeTempJson({ dependencies: filteredDevDependencies }, rootPath);

    handleFile.syncFieldJSonToTarget({
        sourceJsonPath: tempDepPath,
        targetDir: path.resolve(rootPath, 'packages/platform-dependencies'),
        sourceField: 'dependencies',
        targetField: 'dependencies',
        targetFileName: 'package.json',
    });

    handleFile.syncFieldJSonToTarget({
        sourceJsonPath: tempDevDepPath,
        targetDir: path.resolve(rootPath, 'packages/platform-dev-dependencies'),
        sourceField: 'dependencies',
        targetField: 'dependencies',
        targetFileName: 'package.json',
    });

    // 清理临时文件
    if (fs.existsSync(tempDepPath)) fs.unlinkSync(tempDepPath);
    if (fs.existsSync(tempDevDepPath)) fs.unlinkSync(tempDevDepPath);
};
export { handleCodeConfig };
