/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import path from 'path';

/**
 * 更新package.json里面的版本号, 确保上传到私服的版本号和package.json 里面一致
 * @param {*} options
 * @param {*} options.packageJson package.json 的parse内容
 * @param {*} options.packageJsonPath package.json 的路径
 */
export const updatePackageJson = ({
    packageJson,
    packageJsonPath,
}: {
    packageJson: Record<string, string>;
    packageJsonPath: string;
}) => {
    if (!packageJson) {
        console.error(`packageJson is empty`);
        process.exit(1);
    }
    const changedPackageJson = JSON.stringify(packageJson, null, 4);

    // 写入更新后的 package.json 文件
    try {
        fs.writeFileSync(packageJsonPath, changedPackageJson, 'utf-8');
        console.log(`Package version updated to ${packageJson.version}`);
    } catch (error) {
        console.error(`Error writing package.json: ${error.message}`);
        process.exit(1);
    }
};

export const processVersion = (version: string) => {
    // 使用正则表达式匹配版本号格式，允许x3部分可选
    const regex = /^(\d+)\.(\d+)(?:\.(\d+))?/;
    const match = version.match(regex);

    if (!match) {
        // 如果版本号格式不正确，返回原始版本号
        return undefined;
    }

    const x1 = match[1];
    const x2 = match[2];
    const x3 = match[3];

    let processedVersion = `${x1}.${x2}`;

    if (!x3) {
        return `${processedVersion}.0`;
    }

    if (x3 && x3 !== '0') {
        // 规则3和规则4：如果x3是多个数字，去掉以0开头的0，返回其余的数字
        const trimmedX3 = x3.replace(/^0+/, '');
        processedVersion += `.${trimmedX3}`;
    }

    // 使用正则表达式去除任何以"-"开头的部分以及它们后面的内容
    processedVersion = processedVersion.replace(/[^0-9.]+.*/, '');
    return processedVersion;
};

/**
 * 获取改变后的包的版本号
 * @param {*} packageJson package.json 的parse内容
 * @param {*} options
 * @param {*} options.packagesPath 包所在的目录路径
 * @param {*} options.packageType  上传包的类型 - alpha | patch | ''
 * @param {*} options.patchVersion patch-[pre-release] 版本
 * @param {*} options.buildMetadata [build-metadata] 版本
 * @returns
 */
const getChangedVersion = (
    version: string,
    options: {
        packagesPath: string;
        packageType: string;
        patchVersion: string;
        buildMetadata: string;
    }
) => {
    const packageVersion = version;

    // 1.0.0、1.0.0-xxx 处理成 1.0
    // const formatPkgVersion = packageVersion?.match(/(\d+\.\d+)/)[0];
    const formatPkgVersion = processVersion(packageVersion);

    if (!formatPkgVersion) {
        throw new Error('Package version number format error!');
    }

    // 生成带版本号的版本号
    let changedVersion = `${formatPkgVersion}`;
    if (['alpha', 'beta'].includes(options.packageType)) {
        changedVersion = `${changedVersion}-${options.packageType}`;
    } else if (options.packageType === 'patch') {
        changedVersion = `${changedVersion}-patch.${options.buildMetadata || 0}`;
    }
    return changedVersion;
};

export const updatePkgsVersion = (options: {
    packagesPath: string;
    packageType: string;
    patchVersion: string;
    buildMetadata: string;
    packagesVersion: string;
}) => {
    if (!options.packagesVersion) {
        throw new Error('options.packagesVersion is required!');
    }
    const sourceVersoin = options.packagesVersion;

    // 获取 packages 目录下的所有子目录
    const packageDirs = fs.readdirSync(options.packagesPath).filter(file => {
        if (file !== '.svn') {
            return fs.statSync(path.join(options.packagesPath, file)).isDirectory();
        }
        return false;
    });

    // 遍历每个包并发布
    for (const packageDir of packageDirs) {
        const packagePath = path.join(options.packagesPath, packageDir);

        const packageJsonPath = path.join(packagePath, 'package.json');

        // 读取 package.json 文件
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);

        packageJson.version = getChangedVersion(sourceVersoin, options);
        updatePackageJson({ packageJson, packageJsonPath });
        process.chdir(packagePath);

        // 发布包并指定版本号
        // try {
        //   execSync(
        //     `npm publish`,
        //     { stdio: "inherit" }
        //   );
        // } catch (error) {
        //   console.error(`Error during npm publish: ${error.message}`);
        //   process.exit(1);
        // }

        process.chdir('..');
    }
};
