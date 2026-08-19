#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const versionArg = value('--version');
const dryRun = args.includes('--dry-run');
const yes = args.includes('--yes');
const version = versionArg?.replace(/^v/, '');
const run = (command, commandArgs) => execFileSync(command, commandArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const fail = (message) => { throw new Error(message); };

function semver(text) {
  const match = /^([0-9]+)\.([0-9]+)\.([0-9]+)$/.exec(text || '');
  return match ? match.slice(1).map(Number) : null;
}
function compare(a, b) { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }
function scanPublicFiles() {
  const forbidden = /(?:^|\/)Users\/[A-Za-z0-9._-]+|(?:^|\/)home\/[A-Za-z0-9._-]+|BEGIN [A-Z ]+PRIVATE KEY|(?:npm_|gho_|github_pat_)[A-Za-z0-9_]+/;
  const files = run('git', ['ls-files']).split('\n').filter(Boolean);
  for (const relative of files) {
    if (relative === 'tools/release.js' || relative.endsWith('.pyc')) continue;
    const full = path.join(root, relative);
    if (!fs.statSync(full).isFile()) continue;
    if (forbidden.test(fs.readFileSync(full, 'utf8'))) fail(`敏感线索：${relative}`);
  }
}
function packagePreview() {
  const output = run('npm', ['pack', '--dry-run', '--json', '--ignore-scripts']);
  const data = JSON.parse(output)[0];
  for (const file of data.files) {
    if (/\.git|\.bak$|\.pyc$|附件|内部|secret|token/i.test(file.path)) fail(`发布包包含禁止文件：${file.path}`);
  }
  console.log(`npm 包预览通过：${data.filename} (${data.entryCount} files)`);
}

try {
  const requested = semver(version);
  if (!requested) fail('必须提供 --version vX.Y.Z');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const current = semver(pkg.version);
  if (!current || compare(requested, current) < 0) fail(`版本不能低于当前版本 ${pkg.version}`);
  run('git', ['rev-parse', '--is-inside-work-tree']);
  run('npm', ['run', 'check']);
  scanPublicFiles();
  packagePreview();
  console.log(`发布前检查通过：${version}`);
  if (dryRun) { console.log('dry-run：未修改、未提交、未推送、未发布'); process.exit(0); }
  if (!yes) fail('正式发布必须显式使用 --yes；建议先运行 --dry-run');
  fail('自动提交/推送/发布流程尚未启用，请在完成远程仓库保护和人工复核后实现。');
} catch (error) {
  console.error(`release check failed: ${error.message}`);
  process.exit(2);
}
