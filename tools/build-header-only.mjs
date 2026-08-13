import less from 'less';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const input = path.join(root, 'src/header-only.less');
const source = await readFile(input, 'utf8');
const result = await less.render(source, {
  filename: input,
  paths: [path.dirname(input), path.join(root, '.vendor/templates-assets')],
  compress: true,
  javascriptEnabled: true,
  math: 'always',
});

await writeFile(path.join(root, 'css/dotyk-slov-header-only.css'), result.css);
console.log('Built css/dotyk-slov-header-only.css');
