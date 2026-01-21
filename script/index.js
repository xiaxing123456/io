const path = require("path");
const fs = require("fs");
const { geEnvFile } = require("@io-platform/dev-tools");

/** 项目根路径 */
const rootPath = path.resolve(__dirname, "..");

// 输出指令
const args = process.argv.slice(2);
const command = args[0];

/** 获取环境变量文件 */
const handleGeEnvFile = ({ sourcePkgName, targetPkgName }) => {
  let param = {
    sourcePath: path.resolve(rootPath, `env-config/${sourcePkgName}`),
    targetPath: path.resolve(rootPath, `packages/${targetPkgName}`),
  };
  geEnvFile(param);
};

/** 获取环境变量文件 */
const handleGeDocEnvFile = ({ sourcePkgName, targetPkgName }) => {
  let param = {
    sourcePath: path.resolve(rootPath, `env-config/${sourcePkgName}`),
    targetPath: path.resolve(rootPath, `docs/${targetPkgName}`),
  };
  geEnvFile(param);
};

// 定义命令处理函数
const commandHandlers = {
  "init:dev": async () => {
    const promises = [
      Promise.resolve().then(() =>
        handleGeEnvFile({
          sourcePkgName: "engine",
          targetPkgName: "platform/engine",
        }),
      ),
      Promise.resolve().then(() =>
        handleGeDocEnvFile({
          sourcePkgName: "doc-blog",
          targetPkgName: "doc-blog",
        }),
      ),
    ];
    await Promise.all(promises);
  },
};

const run = async () => {
  if (args.length) {
    if (commandHandlers[command]) {
      commandHandlers[command]();
    } else {
      console.log("无效的命令");
    }
  }
};

run();
