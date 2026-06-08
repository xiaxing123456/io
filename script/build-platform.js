const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

/** 项目根路径 */
const rootPath = path.resolve(__dirname, '..');
/** 需要初始化构建的平台包分组 */
const platformPackageGroups = ['core', 'dev'];

/** 获取平台分组下的所有包 */
const getPlatformPackages = () => {
  return platformPackageGroups
    .flatMap((groupName) => {
      const groupPath = path.resolve(rootPath, `packages/platform/${groupName}`);

      if (!fs.existsSync(groupPath)) {
        return [];
      }

      return fs
        .readdirSync(groupPath, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => {
          const pkgPath = path.resolve(groupPath, item.name, 'package.json');
          if (!fs.existsSync(pkgPath)) {
            return null;
          }

          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          return {
            dirname: item.name,
            groupName,
            name: pkg.name,
            hasBuildScript: Boolean(pkg.scripts && pkg.scripts.build),
          };
        });
    })
    .filter(Boolean)
    .sort((a, b) => `${a.groupName}/${a.dirname}`.localeCompare(`${b.groupName}/${b.dirname}`));
};

/** 执行命令 */
const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const commandLine = [command, ...args].join(' ');
    const child = spawn(commandLine, {
      cwd: rootPath,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${commandLine} 执行失败，退出码：${code}`));
      }
    });
  });

const printSummary = ({ builtPackages, skippedPackages }) => {
  console.log('\n构建完成汇总：');

  if (builtPackages.length) {
    console.log('\n已构建：');
    builtPackages.forEach((item) => {
      console.log(`- ${item.name}`);
    });
  } else {
    console.log('\n已构建：无');
  }

  if (skippedPackages.length) {
    console.log('\n未构建：');
    skippedPackages.forEach((item) => {
      console.log(`- ${item.name || item.packagePath}：${item.reason}`);
    });
  } else {
    console.log('\n未构建：无');
  }
};

const run = async () => {
  const platformPackages = getPlatformPackages();
  const builtPackages = [];
  const skippedPackages = [];

  if (!platformPackages.length) {
    console.log('未找到需要初始化构建的平台包');
    return;
  }

  for (const platformPackage of platformPackages) {
    const packagePath = `${platformPackage.groupName}/${platformPackage.dirname}`;

    if (!platformPackage.name) {
      skippedPackages.push({
        packagePath,
        reason: '未配置 package name',
      });
      console.log(`跳过 ${packagePath}，未配置 package name`);
      continue;
    }

    if (!platformPackage.hasBuildScript) {
      skippedPackages.push({
        name: platformPackage.name,
        packagePath,
        reason: '未配置 build 脚本',
      });
      console.log(`跳过 ${platformPackage.name}，未配置 build 脚本`);
      continue;
    }

    console.log(`开始构建 ${platformPackage.name}`);
    await runCommand('pnpm', ['--filter', platformPackage.name, 'build']);
    builtPackages.push({
      name: platformPackage.name,
      packagePath,
    });
  }

  printSummary({ builtPackages, skippedPackages });
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
