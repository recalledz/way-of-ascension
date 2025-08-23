#!/usr/bin/env node

import { readFileSync } from 'fs';

const file = process.argv[2];

async function readInput() {
  if (file) {
    return readFileSync(file, 'utf8');
  }
  return await new Promise(resolve => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}

const content = await readInput();
const patterns = [/(?:^|\s)rm\s+-rf\b/, /\beval\b/, /\bexec\b/];
const matched = patterns.filter(p => p.test(content));

if (matched.length) {
  console.error(`Disallowed tokens detected: ${matched.map(p => p.source).join(', ')}`);
  process.exit(1);
} else {
  console.log('No disallowed tokens found.');
}
