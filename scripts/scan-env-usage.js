import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function run(pattern) {
  try {
    return execSync(
      `rg --no-heading --line-number --glob '!src/config.js' '${pattern}' ${root}`,
      { stdio: 'pipe' }
    )
      .toString()
      .trim();
  } catch {
    return '';
  }
}

const directProcess = run('process\.env\.[A-Z_]');
const directImport = run('import\.meta\.env\.[A-Z_]');
const output = [directProcess, directImport].filter(Boolean).join('\n');

if (output) {
  console.log('Found direct env reads:\n' + output);
} else {
  console.log('No direct env reads found outside src/config.js');
}
