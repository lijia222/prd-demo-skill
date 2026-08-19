#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const script = path.join(__dirname, 'install.py');
const candidates = process.platform === 'win32' ? [['py', ['-3', script, ...process.argv.slice(2)]]] : [['python3', [script, ...process.argv.slice(2)]], ['python', [script, ...process.argv.slice(2)]]];
let last;
for (const [command, args] of candidates) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error && result.error.code === 'ENOENT') {
    last = result.error;
    continue;
  }
  process.exit(result.status ?? 1);
}
console.error(`无法找到 Python 3，无法运行 ${script}`);
if (last) console.error(last.message);
process.exit(1);
