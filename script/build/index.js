const { spawn } = require('child_process');

const buildCommands = {
  'build:admin-vue': 'pnpm init:platform && pnpm init:dev && pnpm build:admin-vue',
};

/**
 * 执行构建命令（Promise化，支持错误处理和退出码）
 * @param {string} command - 要执行的命令
 * @returns {Promise<void>}
 */
const handleBuildCommand = command => {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 执行命令: ${command}\n`);

    const childProcess = spawn(command, {
      shell: true,
      stdio: 'inherit',
    });

    childProcess.on('close', code => {
      if (code === 0) {
        console.log(`\n✅ 命令执行成功\n`);
        resolve();
      } else {
        const error = new Error(`命令执行失败，退出码: ${code}`);
        console.error(`\n❌ ${error.message}\n`);
        reject(error);
      }
    });

    childProcess.on('error', err => {
      console.error(`\n❌ 命令执行出错: ${err.message}\n`);
      reject(err);
    });
  });
};

module.exports = {
  buildCommands,
  handleBuildCommand,
};
