#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.dirname(url.fileURLToPath(import.meta.url));
const SRC = path.resolve(ROOT, '..', 'src');

async function findContracts(dir, out = []) {
  const ents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await findContracts(p, out);
    else if (e.isFile() && e.name.endsWith('_balance.contract.js')) out.push(p);
  }
  return out;
}

const files = await findContracts(SRC);
let total = 0, failed = 0;
for (const file of files) {
  const mod = await import(url.pathToFileURL(file).href);
  if (typeof mod.validate !== 'function') {
    console.log(`SKIP  ${path.relative(SRC, file)} (no validate())`);
    continue;
  }
  total++;
  const res = await mod.validate();
  if (res.ok) {
    console.log(`PASS  ${path.relative(SRC, file)}`);
  } else {
    failed++;
    console.log(`FAIL  ${path.relative(SRC, file)}`);
    for (const err of res.errors) console.log(`  - ${err}`);
  }
}
console.log(`\nContracts: ${total} checked, ${failed} failed.`);
process.exit(failed ? 1 : 0);
