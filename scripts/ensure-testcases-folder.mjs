import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const requirementDir = path.basename(cwd) === '功能需求'
  ? cwd
  : path.join(cwd, '功能需求');
const targetDir = path.join(requirementDir, '测试用例');
let created = false;

try {
  await fs.access(targetDir);
} catch {
  await fs.mkdir(targetDir, { recursive: true });
  created = true;
}

console.log(`Test case folder: ${targetDir}`);
console.log(`Created: ${created ? 'YES' : 'NO'}`);
console.log('后续生成的测试用例文件默认应放置到当前需求文件夹目录下的测试用例子目录。');
