import less from 'less';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const upstream = path.join(root, '.vendor/templates-assets');
const cssInput = path.join(root, 'src/main.less');

await mkdir(path.join(root, 'css'), { recursive: true });
await mkdir(path.join(root, 'js'), { recursive: true });
await mkdir(path.join(root, 'fonts/shoptet'), { recursive: true });

const source = await readFile(cssInput, 'utf8');
const result = await less.render(source, {
  filename: cssInput,
  paths: [path.dirname(cssInput), upstream],
  compress: true,
  javascriptEnabled: true,
  math: 'always',
});

await Promise.all([
  writeFile(path.join(root, 'css/dotyk-slov.css'), result.css),
  cp(path.join(root, 'src/theme.js'), path.join(root, 'js/dotyk-slov.js')),
  cp(path.join(upstream, '11/fonts/shoptet'), path.join(root, 'fonts/shoptet'), { recursive: true }),
]);

console.log('Built css/dotyk-slov.css and js/dotyk-slov.js.');

