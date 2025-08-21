#!/usr/bin/env node

import { readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const FEATURES_DIR = join(ROOT, 'src', 'features');

let errors = [];

async function validate() {
  const features = readdirSync(FEATURES_DIR).filter(f => {
    const full = join(FEATURES_DIR, f);
    return statSync(full).isDirectory();
  });

  for (const feat of features) {
    const dataDir = join(FEATURES_DIR, feat, 'data');
    if (!existsSync(dataDir)) continue;
    const contract = join(dataDir, '_balance.contract.js');
    if (!existsSync(contract)) {
      errors.push(`Missing contract for feature: ${feat}`);
      continue;
    }
    try {
      const mod = await import(contract);
      if (!mod.default) {
        errors.push(`Contract does not export default object: ${contract}`);
      }
    } catch (e) {
      errors.push(`Failed loading contract ${contract}: ${e.message}`);
    }
  }

  if (errors.length) {
    console.error('Balance validation failed:');
    for (const e of errors) console.error(' - ' + e);
    process.exit(1);
  } else {
    console.log('Balance validation passed.');
  }
}

validate().catch(e => {
  console.error(e);
  process.exit(1);
});
