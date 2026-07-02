export { generateScriptTags } from './generate-script-tag';
export { copyFile, copyFiles, copyDirectory, deleteFolder } from './handle-files';
export { gePublicFile, geEnvFile, genConfigFileForEnv } from './handle-project-files';
export { handleCodeConfig } from './handle-code-config';
export { copyFileOrDirectory, syncFieldJSonToTarget } from './copy-directory-plus';
export { updatePkgsVersion, processVersion } from './handle-pkg-version';
export { optimizeDepsBySourceScan } from './vite-plugin/vite-plugin-auto-optimize-deps';
