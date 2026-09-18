#!/usr/bin/env node
// 敏感数据检查：扫描 skill 包，避免把凭据、个人信息、内网标识带进仓库或外部产物。
// 用法：
//   node "<skill_dir>/scripts/check-sensitive.mjs" [--root <dir>] [--extra <regex>]... [--json]
// 退出码：0 = 无高危命中；1 = 有高危命中或本地私有文件未被忽略。
//
// 设计约定：
// - 一律只输出打码后的命中片段，不回显原始敏感值
// - `*.local.md` 是本机私有约定文件（含站点、账号等取值），必须被 git 忽略；被跟踪即判为高危
// - 本脚本自身不内置任何组织专有模式，可通过 --extra 追加
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);

function takeFlag(name) {
  const i = argv.indexOf(name);
  if (i === -1) return [];
  const values = [];
  for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j += 1) values.push(argv[j]);
  return values;
}

const roots = takeFlag('--root');
const root = roots.length ? path.resolve(roots[0]) : skillDir;
const extras = takeFlag('--extra');
const asJson = argv.includes('--json');

const TEXT_EXT = new Set(['.md', '.mjs', '.ps1', '.js', '.json', '.yaml', '.yml', '.txt', '.csv', '.gitignore', '.sh', '.py', '']);
const ARTIFACT_EXT = new Set(['.xlsx', '.docx', '.xmind', '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.zip', '.doc', '.ppt']);

const PATTERNS = [
  ['凭据', /ATATT[A-Za-z0-9_\-=]{4,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_\-]{20,}|xox[baprs]-[A-Za-z0-9\-]{10,}|AKIA[0-9A-Z]{16}/g],
  ['私钥', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ['JWT', /eyJ[A-Za-z0-9_\-]{15,}\.[A-Za-z0-9_\-]{10,}/g],
  ['Bearer 常量', /Bearer\s+[A-Za-z0-9._\-]{20,}/g],
  ['口令字面量', /(password|passwd|pwd|密码)\s*[:=]\s*\S{4,}/gi],
  ['密钥字面量', /(token|secret|api[_-]?key)\s*[:=]\s*[A-Za-z0-9._\-]{16,}/gi],
  ['邮箱地址', /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g],
  ['内网域名', /[A-Za-z0-9\-]+\.(?:corp|internal|intranet|lan)\.[A-Za-z0-9.\-]+/gi],
  ['内网 IP', /\b(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/g],
  ['本机绝对路径', /\/Users\/[A-Za-z0-9._\-]+|C:\\Users\\[A-Za-z0-9._\-]+/g],
  ['疑似工号/账号', /\b(?:[a-z]{2,8}\d{4,}|user_\d{4,})\b/g],
  ['手机号', /(?<!\d)1[3-9]\d{9}(?!\d)/g],
  ...extras.map((p) => ['--extra', new RegExp(p, 'g')]),
];

function mask(value) {
  const v = value.trim();
  if (v.length <= 6) return v[0] + '*'.repeat(Math.max(v.length - 1, 1));
  return `${v.slice(0, 3)}${'*'.repeat(Math.min(6, v.length - 3))}(${v.length})`;
}

function isIgnored(relPath) {
  const r = spawnSync('git', ['check-ignore', '-q', relPath], { cwd: root });
  return r.status === 0;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const findings = [];
const notes = [];
for (const full of walk(root)) {
  const rel = path.relative(root, full);
  const ext = path.extname(full).toLowerCase();
  if (ARTIFACT_EXT.has(ext)) {
    findings.push({ level: 'warn', kind: '产物文件', file: rel, hit: `${ext} 文件可能含客户数据/账号截图` });
    continue;
  }
  if (!TEXT_EXT.has(ext)) continue;

  const isPrivate = rel.endsWith('.local.md');
  const ignored = isIgnored(rel);
  if (isPrivate) {
    if (!ignored) findings.push({ level: 'high', kind: '本地私有文件未被忽略', file: rel, hit: '应加入 .gitignore（例如 *.local.md）' });
    else notes.push(`本地私有文件已忽略，仅本机保留：${rel}`);
  }

  const lines = fs.readFileSync(full, 'utf8').split('\n');
  for (const [kind, re] of PATTERNS) {
    re.lastIndex = 0;
    for (let i = 0; i < lines.length; i += 1) {
      const m = lines[i].match(re);
      if (!m) continue;
      for (const hit of m) {
        if (isPrivate) continue; // 私有文件里的取值是预期内容
        const level = ['凭据', '私钥', 'JWT', 'Bearer 常量', '口令字面量', '密钥字面量'].includes(kind) ? 'high' : 'warn';
        findings.push({ level, kind, file: rel, line: i + 1, hit: mask(hit) });
      }
    }
  }
}

const summary = {
  root,
  scanned: walk(root).length,
  high: findings.filter((f) => f.level === 'high').length,
  warn: findings.filter((f) => f.level === 'warn').length,
  findings,
  notes,
};

if (asJson) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`扫描目录: ${root}`);
  console.log(`文件数: ${summary.scanned} | 高危: ${summary.high} | 提醒: ${summary.warn}`);
  for (const n of notes) console.log(`  [ok]   ${n}`);
  for (const f of findings) {
    console.log(`  [${f.level === 'high' ? 'HIGH' : 'warn'}] ${f.kind} @ ${f.file}${f.line ? ':' + f.line : ''} -> ${f.hit}`);
  }
  if (!findings.length && !notes.length) console.log('  未发现可疑内容');
}

process.exit(summary.high ? 1 : 0);
