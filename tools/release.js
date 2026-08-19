#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const requestedText = value('--version')?.replace(/^v/, '');
const dryRun = args.includes('--dry-run');
const yes = args.includes('--yes');
const run = (command, commandArgs) => execFileSync(command, commandArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const fail = (message) => { throw new Error(message); };

function semver(text) {
  const match = /^([0-9]+)\.([0-9]+)\.([0-9]+)$/.exec(text || '');
  return match ? match.slice(1).map(Number) : null;
}
function scanPublicFiles() {
  const forbidden = /(?:^|\/)Users\/[A-Za-z0-9._-]+|(?:^|\/)home\/[A-Za-z0-9._-]+|BEGIN [A-Z ]+PRIVATE KEY|(?:npm_|gho_|github_pat_)[A-Za-z0-9_]+/;
  for (const relative of run('git', ['ls-files']).split('\n').filter(Boolean)) {
    if (relative === 'tools/release.js' || relative.endsWith('.pyc')) continue;
    const full = path.join(root, relative);
    if (fs.statSync(full).isFile() && forbidden.test(fs.readFileSync(full, 'utf8'))) fail(`敏感线索：${relative}`);
  }
}
function packagePreview() {
  const data = JSON.parse(run('npm', ['pack', '--dry-run', '--json', '--ignore-scripts']))[0];
  for (const file of data.files) if (/\.git|\.bak$|\.pyc$|secret|token/i.test(file.path)) fail(`发布包包含禁止文件：${file.path}`);
  console.log(`npm 包预览通过：${data.filename} (${data.entryCount} files)`);
}
function publishPackage() {
  const result = spawnSync('npm', ['publish', '--access', 'public', '--ignore-scripts'], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) fail(`npm publish 失败，退出码 ${result.status}`);
}

try {
  const requested = semver(requestedText);
  if (!requested) fail('必须提供 --version vX.Y.Z');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (!semver(pkg.version) || pkg.version !== requestedText) fail(`当前版本为 ${pkg.version}，首次发布前请先单独更新并提交版本元数据`);
  if (run('git', ['status', '--porcelain'])) fail('工作区有未提交修改，请先检查并提交');
  run('git', ['rev-parse', '--is-inside-work-tree']);
  run('git', ['remote', 'get-url', 'origin']);
  run('npm', ['run', 'check']);
  scanPublicFiles();
  packagePreview();
  const tag = `v${requestedText}`;
  if (run('git', ['tag', '--list', tag])) fail(`Tag 已存在：${tag}`);
  console.log(`发布目标：${tag}`);
  if (dryRun) { console.log('dry-run：未修改、未提交、未推送、未发布'); process.exit(0); }
  if (!yes) fail('正式发布必须显式使用 --yes；建议先运行 --dry-run');
  run('git', ['push', 'origin', 'main']);
  publishPackage();
  run('git', ['tag', '-a', tag, '-m', `release: ${tag}`]);
  run('git', ['push', 'origin', tag]);
  run('gh', ['auth', 'status']);
  run('gh', ['release', 'create', tag, '--generate-notes', '--verify-tag']);
  console.log(`发布完成：${tag}`);
} catch (error) {
  console.error(`release failed: ${error.message}`);
  process.exit(2);
}
