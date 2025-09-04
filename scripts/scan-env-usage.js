import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(pattern) {
  try {
    const cmd = `rg "${pattern}" src --glob '!node_modules' --glob '!scripts/scan-env-usage.js'`;
    return execSync(cmd, { cwd: root, stdio: ['pipe', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
}

const hits = [];
for (const line of run('process\\.env').split('\n')) {
  if (line && !line.includes('src/config.js')) hits.push(line);
}
for (const line of run('import\\.meta\\.env').split('\n')) {
  if (line && !line.includes('src/config.js')) hits.push(line);
}

if (hits.length === 0) {
  console.log('No direct env reads found outside src/config.js');
} else {
  console.log('Direct env reads detected:');
  for (const h of hits) console.log(h);
}
