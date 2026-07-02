import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const targetDir = path.join(cwd, '功能需求');
let created = false;

try {
  await fs.access(targetDir);
} catch {
  await fs.mkdir(targetDir, { recursive: true });
  created = true;
}

console.log(`Requirements folder: ${targetDir}`);
console.log(`Created: ${created ? 'YES' : 'NO'}`);
console.log('请将需求文档、设计截图或设计稿文件放置到该路径下。');
