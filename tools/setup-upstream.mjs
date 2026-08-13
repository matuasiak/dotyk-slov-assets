import { access, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root, '.vendor/templates-assets');
const commit = 'c99b76dd41f570d6c68248a4be982e28ab99644d';

try {
  await access(path.join(target, '11/css/main-11.less'));
  console.log('Shoptet upstream is already available.');
  process.exit(0);
} catch {}

await mkdir(target, { recursive: true });

for (const args of [
  ['init', target],
  ['-C', target, 'remote', 'add', 'origin', 'https://github.com/Shoptet/templates-assets.git'],
  ['-C', target, 'fetch', '--depth', '1', 'origin', commit],
  ['-C', target, 'checkout', '--detach', 'FETCH_HEAD'],
]) {
  const result = spawnSync('git', args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Installed Shoptet templates-assets at ${commit}.`);

