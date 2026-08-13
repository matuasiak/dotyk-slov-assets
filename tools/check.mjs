import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = [
  'css/dotyk-slov.css',
  'js/dotyk-slov.js',
  'fonts/shoptet/shoptet.woff2',
  'images/hero.jpg',
  'images/promo1.jpg',
  'images/promo2.jpg',
];

for (const file of files) {
  const info = await stat(path.join(root, file));
  if (!info.size) throw new Error(`${file} is empty`);
}

const css = await readFile(path.join(root, 'css/dotyk-slov.css'), 'utf8');
const js = await readFile(path.join(root, 'js/dotyk-slov.js'), 'utf8');

for (const marker of ['.navigation-in', '.products-block', '.ds-home-hero']) {
  if (!css.includes(marker)) throw new Error(`CSS is missing ${marker}`);
}

for (const marker of ['.content-wrapper.homepage-box.before-carousel', 'ds-home-hero']) {
  if (!js.includes(marker)) throw new Error(`JS is missing ${marker}`);
}

console.log('Clean Classic/Blank build verified.');
