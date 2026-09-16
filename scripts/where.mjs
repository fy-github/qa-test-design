#!/usr/bin/env node
// 解析 qa-test-design 当前运行宿主，输出 skill 包目录与本地知识库 notes 根目录。
// 用法：node "<skill_dir>/scripts/where.mjs" [--ensure]
// --ensure：创建解析出的 notes_root 目录（不写入任何文件）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOSTS = [
  { host: 'hermes', dirName: '.hermes', envVars: ['HERMES_HOME'] },
  { host: 'claude', dirName: '.claude', envVars: ['CLAUDE_CONFIG_DIR'] },
  { host: 'codex', dirName: '.codex', envVars: ['CODEX_HOME'] },
];

// 包根目录：scripts/where.mjs 的上一级，跨宿主通用
const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ensure = process.argv.slice(2).includes('--ensure');

// 宿主 home 优先按环境变量判定（Hermes profile、自定义 CODEX_HOME 等场景）
function homeFromEnv() {
  for (const candidate of HOSTS) {
    for (const key of candidate.envVars) {
      const value = process.env[key];
      if (value && skillDir.startsWith(path.resolve(value) + path.sep)) {
        return { host: candidate.host, home: path.resolve(value), source: `env:${key}` };
      }
    }
  }
  return null;
}

// 其次按包自身路径判定，避免多宿主共存时的误判
function homeFromSkillPath() {
  const segments = skillDir.split(path.sep);
  for (const candidate of HOSTS) {
    const index = segments.lastIndexOf(candidate.dirName);
    if (index !== -1) {
      const home = segments.slice(0, index + 1).join(path.sep) || path.sep;
      return { host: candidate.host, home, source: 'skill-dir' };
    }
  }
  return null;
}

const resolvedHome = homeFromEnv() || homeFromSkillPath();
const notesRoot = process.env.QA_KB_ROOT
  ? path.resolve(process.env.QA_KB_ROOT)
  : resolvedHome
    ? path.join(resolvedHome.home, 'extensions', 'ad_hoc', 'notes')
    : path.join(process.cwd(), '功能需求', '知识库');

if (ensure) {
  fs.mkdirSync(notesRoot, { recursive: true });
}

console.log(JSON.stringify({
  host: resolvedHome ? resolvedHome.host : 'unknown',
  host_home: resolvedHome ? resolvedHome.home : null,
  resolved_from: process.env.QA_KB_ROOT ? 'env:QA_KB_ROOT' : (resolvedHome ? resolvedHome.source : 'cwd-fallback'),
  skill_dir: skillDir,
  notes_root: notesRoot,
  notes_root_exists: fs.existsSync(notesRoot),
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
}, null, 2));
