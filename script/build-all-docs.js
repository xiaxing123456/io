const path = require("path");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;
const dotenv = require("dotenv");

/** 项目根路径 */
const rootDir = path.resolve(__dirname, "..");
const docsDir = path.join(rootDir, "docs");
const portalDir = path.join(docsDir, "docs-portal");

// 文档项目列表（与 docs-portal/script.js 中的配置保持一致）
const docProjects = ["doc-blog", "doc-ui"];

// 存储所有版本信息
const allVersions = {};

console.log("🚀 开始构建所有文档项目...\n");

// 构建每个文档项目
for (const project of docProjects) {
  const projectPath = path.join(docsDir, project);
  const projectDistSrc = path.join(projectPath, "dist");

  // 读取 .env.production 文件获取名称和版本号
  const envPath = path.join(projectPath, ".env.production");
  let docsName = project; // 默认使用项目名称
  let docsVersion = "";

  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    docsName = envConfig.VITE_DOCS_NAME || docsName;
    docsVersion = envConfig.VITE_DOCS_VERSION || "";
  }

  if (!fs.existsSync(projectPath)) {
    console.log(`⚠️  跳过 ${project}（目录不存在）`);
    continue;
  }

  console.log(`\n📦 构建 ${project}...`);
  console.log(`📍 文档名称: ${docsName}, 版本: ${docsVersion}`);

  try {
    // 在项目目录下执行构建
    execSync("pnpm run build", {
      cwd: projectPath,
      stdio: "inherit",
    });

    // 复制构建产物到 docs-portal 对应版本目录
    if (fs.existsSync(projectDistSrc)) {
      const projectDistDest = path.join(portalDir, docsName, docsVersion);
      console.log(`📤 复制 ${project} 的构建产物到: ${docsName}/${docsVersion}`);

      // 确保目标目录存在
      fs.ensureDirSync(projectDistDest);

      // 复制构建产物（替换已有文件）
      fs.copySync(projectDistSrc, projectDistDest, { overwrite: true });
    } else {
      console.error(`❌ ${project} 的构建产物不存在: ${projectDistSrc}`);
    }

    // 读取 version.json 并收集版本信息
    const versionJsonPath = path.join(projectPath, "public", "version.json");
    if (fs.existsSync(versionJsonPath)) {
      console.log(`📋 读取 ${project} 的版本信息...`);
      const versionData = JSON.parse(fs.readFileSync(versionJsonPath, "utf-8"));

      // 按文档名称分组存储版本信息
      if (!allVersions[docsName]) {
        allVersions[docsName] = [];
      }

      // 合并版本数据
      if (versionData.data && Array.isArray(versionData.data)) {
        allVersions[docsName].push(...versionData.data);
      }
    }
  } catch (error) {
    console.error(`❌ 构建 ${project} 失败:`, error.message);
    process.exit(1);
  }
}

// 生成合并后的 version.js 文件
console.log("\n📝 生成合并的版本信息文件...");
const versionJsPath = path.join(portalDir, "version.js");
const versionJsContent = `export default ${JSON.stringify(allVersions, null, 2)};\n`;

fs.writeFileSync(versionJsPath, versionJsContent, "utf-8");
console.log(`✅ 版本信息已写入: ${versionJsPath}`);

console.log("\n✅ 所有文档构建完成！");
console.log(`📁 输出目录: ${portalDir}`);
console.log('\n💡 提示: 运行 "pnpm preview:docs" 预览构建结果');
