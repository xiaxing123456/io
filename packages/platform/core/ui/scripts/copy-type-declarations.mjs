import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const packageDir = join(rootDir, '..');
const sourceDir = join(packageDir, 'src', 'types');
const targetDir = join(packageDir, 'dist', 'types', 'types');

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });
await cp(sourceDir, targetDir, {
  recursive: true,
  filter: async source => {
    const sourceStat = await stat(source);

    return sourceStat.isDirectory() || source.endsWith('.d.ts');
  },
});

const sourceIndexFile = join(sourceDir, 'index.ts');
const typesIndexFile = join(targetDir, 'index.d.ts');
const typesIndex = await readFile(sourceIndexFile, 'utf8');

await writeFile(typesIndexFile, typesIndex);
