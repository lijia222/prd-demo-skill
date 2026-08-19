#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
const required = [
  'core/SKILL.md',
  'core/references/prd/workflow.md',
  'core/references/demo/workflow.md',
  'core/references/demo/marker.md',
  'core/references/change-sync/workflow.md',
  'core/references/consistency-audit/checklist.md',
  'installer/index.js',
  'installer/install.py',
  'installer/install.sh',
  'installer/install.ps1',
];
const forbidden = /(?:^|\/)Users\/[A-Za-z0-9._-]+|(?:^|\/)home\/[A-Za-z0-9._-]+|BEGIN [A-Z ]+PRIVATE KEY|(?:npm_|gho_|github_pat_)[A-Za-z0-9_]+/;

if (pkg.name !== '@cauthy/prd-demo-skill') throw new Error('package name mismatch');
if (pkg.version !== version || manifest.version !== version) throw new Error('version mismatch');
for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) throw new Error(`missing: ${relative}`);
}
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    const relative = path.relative(root, full);
    if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) scan(full);
    if (entry.isFile() && !entry.name.endsWith('.pyc') && !['tools/check.js', 'tools/release.js'].includes(relative)) {
      const text = fs.readFileSync(full, 'utf8');
      if (forbidden.test(text)) throw new Error(`forbidden content: ${relative}`);
    }
  }
}
scan(root);
console.log(`check passed: ${version}`);
