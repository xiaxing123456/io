import { Plugin, UserConfig } from 'vite';
import { readFileSync, statSync } from 'fs';
import fg from 'fast-glob';
import path, { resolve } from 'path';
import { parse as parseSFC } from '@vue/compiler-sfc';

interface OptimizeDepsPluginOptions {
    /** 包名与源码路径映射 */
    packagePathMap: Record<string, string>;
    /** 需要自定义忽略的依赖 */
    customIgnoreDeps?: string[];
}

/**
 * 扫描源码依赖并优化 Vite 配置
 * 1. 扫描源码依赖，加入 optimizeDeps.include
 * 2. 将源码路径加入 server.watch.ignored，保证源码改动热更新
 */
export function optimizeDepsBySourceScan(options: OptimizeDepsPluginOptions): Plugin {
    const rootPackages = Object.keys(options.packagePathMap);

    /** 判断是否外部依赖 */
    const isExternalDep = (dep: string) => {
        if (dep.startsWith('.') || dep.startsWith('/')) return false;
        return !rootPackages.some(pkg => dep === pkg || dep.startsWith(`${pkg}/`));
    };

    /** 从代码中提取外部依赖 */
    const extractDepsFromCode = (code: string) => {
        const deps = new Set<string>();
        const patterns = [
            /import\s+(?:[\s\S]+?)from\s+['"]([^'"]+)['"]/g,
            /import\s+['"]([^'"]+)['"]/g,
            /require\(['"]([^'"]+)['"]\)/g,
        ];
        patterns.forEach(pattern => {
            Array.from(code.matchAll(pattern)).forEach(match => {
                const dep = match[1];
                if (isExternalDep(dep)) deps.add(dep);
            });
        });
        return deps;
    };

    /** 从 Vue 文件中提取外部依赖 */
    const extractDepsFromVueFile = async (filePath: string) => {
        const content = readFileSync(filePath, 'utf-8');
        const sfc = parseSFC(content);
        const deps = new Set<string>();
        const scripts: string[] = [];
        if (sfc.descriptor.script) scripts.push(sfc.descriptor.script.content);
        if (sfc.descriptor.scriptSetup) scripts.push(sfc.descriptor.scriptSetup.content);
        scripts.forEach(code => {
            extractDepsFromCode(code).forEach(d => deps.add(d));
        });
        return deps;
    };

    /** 扫描所有源码依赖 */
    const scanAllDeps = async (): Promise<string[]> => {
        const allDeps = new Set<string>();
        await Promise.all(
            rootPackages.map(async pkg => {
                let rootDir = options.packagePathMap[pkg];
                if (!path.isAbsolute(rootDir)) rootDir = resolve(process.cwd(), rootDir);

                const stat = statSync(rootDir);
                if (stat.isDirectory() && !/[/\\]src$/.test(rootDir))
                    rootDir = resolve(rootDir, 'src');

                const files = await fg(['**/*.{ts,tsx,js,jsx,vue}'], {
                    cwd: rootDir,
                    absolute: true,
                    ignore: ['**/__tests__/**', '**/*.spec.*', '**/*.test.*'],
                });

                await Promise.all(
                    files.map(async file => {
                        const deps = file.endsWith('.vue')
                            ? await extractDepsFromVueFile(file)
                            : extractDepsFromCode(readFileSync(file, 'utf-8'));
                        deps.forEach(d => allDeps.add(d));
                    })
                );
            })
        );

        const excludedPrefixes = rootPackages.concat(options.customIgnoreDeps || []);
        return Array.from(allDeps).filter(
            dep => !excludedPrefixes.some(prefix => dep === prefix || dep.startsWith(`${prefix}/`))
        );
    };

    return {
        name: 'vite:optimize-deps-by-source-scan',
        async config(config: UserConfig) {
            // 扫描依赖并加入 optimizeDeps.include
            const deps = await scanAllDeps();
            config.optimizeDeps = config.optimizeDeps || {};
            config.optimizeDeps.include = [...(config.optimizeDeps.include || []), ...deps];
            config.optimizeDeps.exclude = [
                ...(config.optimizeDeps.exclude || []),
                ...rootPackages,
                ...(options.customIgnoreDeps || []),
            ];

            // 将源码路径加入 server.watch.ignored，保证改动热更新
            config.server = config.server || {};
            config.server.watch = config.server.watch || {};
            let ignoredArr: any[] = [];
            if (Array.isArray(config.server.watch.ignored)) {
                ignoredArr = config.server.watch.ignored;
            } else if (config.server.watch.ignored) {
                ignoredArr = [config.server.watch.ignored];
            }
            const ignored = new Set(ignoredArr);
            // 给每个 rootPackage 生成 '!**/node_modules/.../src/**' 形式
            rootPackages.forEach(pkg => {
                let dir = options.packagePathMap[pkg];
                if (!path.isAbsolute(dir)) dir = path.resolve(process.cwd(), dir);

                // 将绝对路径转为 glob 格式
                const normalizedDir = dir.replace(/\\/g, '/');
                const globPattern = normalizedDir.replace(/^.*?node_modules\//, '**/node_modules/');
                ignored.add(`!${globPattern}/**`);
            });

            config.server.watch.ignored = Array.from(ignored);

            // 别名处理
            // 插件内部默认处理的别名
            const defaultPackageAlias: Record<string, string> = options.packagePathMap;

            // 用户自定义 alias
            const userAlias = config.resolve?.alias || {};

            // 合并，用户自定义的优先
            config.resolve = config.resolve || {};
            config.resolve.alias = {
                ...defaultPackageAlias, // 插件默认别名
                ...userAlias, // 用户自定义别名
            };
        },
    };
}
