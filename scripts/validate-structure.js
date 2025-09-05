#!/usr/bin/env node

/**
 * AUTOMATED PROJECT STRUCTURE & ARCHITECTURE VALIDATOR
 * Enforces:
 *  - Doc sync with docs/project-structure.md and docs/ARCHITECTURE.md
 *  - Feature-first architecture (state/logic/mutators/selectors/ui/migrations)
 *  - UI purity (no state writes, no rules)
 *  - No DOM in mutators/logic/selectors
 *  - App shell integrity (src/ui/app.js only bootstraps)
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname, normalize, sep } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const STRUCTURE_FILE = join(PROJECT_ROOT, 'docs', 'project-structure.md');
const ARCH_FILE      = join(PROJECT_ROOT, 'docs', 'ARCHITECTURE.md');
const APP_SHELL      = join(PROJECT_ROOT, 'src', 'ui', 'app.js');
const CONTROLLER     = join(PROJECT_ROOT, 'src', 'game', 'GameController.js');

const ARG_AUTO_UPDATE_OLD  = process.argv.includes('--auto-update');       // legacy
const ARG_AUTO_UPDATE_DOCS = process.argv.includes('--auto-update-docs');  // new
const AUTO_UPDATE = ARG_AUTO_UPDATE_OLD || ARG_AUTO_UPDATE_DOCS;

class StructureValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.newFiles = [];
    this.currentStructure = {};   // { path: {type:'file'|'directory', size, ext} }
    this.documentedFiles = new Set();
    this.features = [];           // e.g., ['alchemy','progression',...]
    this.logOutput = [];
  }

  log(msg) { this.logOutput.push(msg); console.log(msg); }

  async validate() {
    this.log('🤖 ENFORCING AI VERIFICATION PROTOCOL (feature-first + doc-sync)...');

    // 1) Existence of docs
    if (!this.verifyDocumentationExists()) return this.generateReport();

    // 2) Scan tree and docs
    this.scanCurrentStructure();
    this.parseDocumentedStructure();

    // 3) Gather features
    this.collectFeatures();

    // 4) Core integrity & doc mismatches
    this.findDocViolations();

    // 5) Architecture checks (content-level)
    this.runArchitectureChecks();

    // 5a) Balance contract validation
    this.runBalanceValidation();

    // 6) Auto-update docs if requested and needed
    if (AUTO_UPDATE && this.newFiles.length > 0) {
      this.fixProjectStructureDoc();
    }
    if (AUTO_UPDATE) {
      this.ensureArchitectureDocHasRequiredSections();
    }

    return this.generateReport();
  }

  verifyDocumentationExists() {
    let ok = true;
    if (!existsSync(STRUCTURE_FILE)) {
      this.errors.push('CRITICAL: docs/project-structure.md missing!');
      ok = false;
    }
    if (!existsSync(ARCH_FILE)) {
      this.errors.push('CRITICAL: docs/ARCHITECTURE.md missing!');
      ok = false;
    }
    return ok;
  }

  scanCurrentStructure() {
    const ignoreDirs = ['node_modules', '.git', '.vscode', '.idea'];
    const importantExtensions = ['.js', '.md', '.html', '.css', '.json'];

    const scanDir = (dirPath, relativePath = '') => {
      let items = [];
      try { items = readdirSync(dirPath); } catch { this.warnings.push(`Cannot scan directory: ${dirPath}`); }
      for (const item of items) {
        if (ignoreDirs.includes(item)) continue;
        const fullPath = join(dirPath, item);
        const relPath = join(relativePath, item).replace(/\\/g, '/');
        let stats;
        try { stats = statSync(fullPath); } catch { continue; }
        if (stats.isDirectory()) {
          this.currentStructure[relPath + '/'] = { type: 'directory' };
          scanDir(fullPath, relPath);
        } else {
          const ext = '.' + (item.split('.').pop() || '');
          if (importantExtensions.includes(ext)) {
            this.currentStructure[relPath] = { type: 'file', size: stats.size, ext };
          }
        }
      }
    };
    scanDir(PROJECT_ROOT);
  }

  parseDocumentedStructure() {
    try {
      const content = readFileSync(STRUCTURE_FILE, 'utf8');
      const lines = content.split(/\r?\n/);
      let inTree = false;
      const stack = [];
      for (const line of lines) {
        if (!inTree && line.includes('way-of-ascension/')) { inTree = true; continue; }
        if (!inTree) continue;
        if (line.trim() === '```') break;

        const nameMatch = line.match(/[├└]──\s*([^\s#]+)/);
        if (!nameMatch) continue;

        // depth via pipes/indentation (simple heuristic)
        const depth = (line.match(/[│ ]/g) || []).length / 4;
        const name = nameMatch[1];

        stack.splice(depth);
        stack.push(name.replace(/\/$/, ''));
        const path = stack.join('/');

        // Normalize slashes to forward
        this.documentedFiles.add(path.replace(/\\/g, '/'));
      }
    } catch (e) {
      this.errors.push(`Cannot parse project-structure.md: ${e.message}`);
    }
  }

  collectFeatures() {
    // First-level directories under src/features/
    Object.keys(this.currentStructure)
      .filter(k => this.currentStructure[k].type === 'directory')
      .filter(k => k.startsWith('src/features/') && k.split('/').length === 3) // e.g., src/features/alchemy/
      .forEach(dir => {
        const parts = dir.split('/');
        const name = parts[2]; // features/<name>/
        if (name && !this.features.includes(name)) this.features.push(name);
      });
  }

  findDocViolations() {
    const allFiles = Object.keys(this.currentStructure)
      .filter(f => this.currentStructure[f].type === 'file')
      .map(f => f.replace(/\\/g, '/'));

    // New/undocumented files
    for (const file of allFiles) {
      if (this.shouldIgnoreFile(file)) continue;
      const documented = this.documentedFiles.has(file);
      if (!documented) {
        this.newFiles.push(file);
        this.errors.push(`UNDOCUMENTED FILE: ${file}`);
      }
    }

    // Required core files (updated for app shell + arch)
    const coreFiles = [
      'src/ui/app.js',
      'src/game/GameController.js',
      'docs/project-structure.md',
      'docs/ARCHITECTURE.md',
      'index.html',
      'style.css'
    ];

    for (const cf of coreFiles) {
      if (!allFiles.includes(cf)) this.errors.push(`MISSING CORE FILE: ${cf}`);
    }
  }

  shouldIgnoreFile(file) {
    const ignorePatterns = [
      /package-lock\.json$/,
      /\.log$/,
      /\.tmp$/,
      /\.cache$/,
      /eslint\.config\./,
      /\.windsurf\//,
      /^validation\.log$/
    ];
    return ignorePatterns.some(rx => rx.test(file));
  }

  // ---------- Architecture checks ----------

  runArchitectureChecks() {
    this.checkAppShell();
    this.checkGameController();
    this.checkFeatureSkeletons();
    this.checkUIPurity();
    this.checkNoDomInMutatorsLogicSelectors();
    this.checkCrossSliceWrites();
    this.checkArchitectureDoc();
  }

  runBalanceValidation() {
    try {
      execSync('npm run lint:balance', { stdio: 'inherit', cwd: PROJECT_ROOT });
    } catch (e) {
      this.errors.push('Balance contract validation failed');
    }
  }

  checkAppShell() {
    if (!existsSync(APP_SHELL)) {
      this.errors.push(`App shell missing: ${this.rel(APP_SHELL)}`);
      return;
    }
    const txt = readFileSync(APP_SHELL, 'utf8');

    // Must not import feature internals like mutators/logic/selectors directly
    const badImport = /from\s+["']\.\.\/features\/[^"']+\/(mutators|logic|selectors)\.js["']/;
    if (badImport.test(txt)) {
      this.errors.push('app.js imports feature internals (mutators/logic/selectors). Only import registry, sidebar, debug, controller.');
    }
  }

  checkGameController() {
    if (!existsSync(CONTROLLER)) {
      this.errors.push(`Missing controller: ${this.rel(CONTROLLER)}`);
      return;
    }
    const txt = readFileSync(CONTROLLER, 'utf8');
    if (/engineTick/.test(txt)) {
      this.errors.push('GameController references legacy engineTick. Replace with tickFeatures loop.');
    }
  }

  checkFeatureSkeletons() {
    for (const feat of this.features) {
      const base = join('src', 'features', feat);
      const required = [
        'state.js', 'mutators.js', 'selectors.js', 'logic.js', 'migrations.js'
      ];
      for (const f of required) {
        const p = `${base}/${f}`;
        if (!this.currentStructure[p]) {
          this.errors.push(`Feature "${feat}" missing ${f}`);
        }
      }
      const descriptorOk = this.currentStructure[`${base}/index.js`] || this.currentStructure[`${base}/feature.js`];
      if (!descriptorOk) {
        this.errors.push(`Feature "${feat}" missing descriptor (index.js or feature.js)`);
      }
    }
  }

  // UI purity: forbid state writes, direct S import, random rules, timers
  checkUIPurity() {
    const files = Object.keys(this.currentStructure)
      .filter(p => this.currentStructure[p].type === 'file')
      .filter(p => /^src\/features\/[^/]+\/ui\/.+\.js$/.test(p));
    for (const file of files) {
      const txt = this.readSafe(file);

      if (!txt) continue;

      // Direct state import (legacy S)
      if (/(?:^|\n)\s*import\s+{?\s*S\s*}?\s*from\s*['"].*shared\/state\.js['"]/.test(txt)) {
        this.errors.push(`UI state violation: ${file} imports S from shared/state.js`);
      }

      // Writes to root.* in UI (heuristic: root.<...> = / ++ / -- / .push( / .splice( / .pop()
      const writePattern = /\broot\.[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*\s*(?:=|\+\+|--|\.push\(|\.splice\(|\.pop\(|\.unshift\(|\.shift\()/;
      if (writePattern.test(txt)) {
        this.errors.push(`UI write violation: ${file} mutates root.* (use mutators)`);
      }

      // Game rules in UI (heuristics)
      if (/Math\.random\(/.test(txt)) {
        this.warnings.push(`UI rule: ${file} uses Math.random() — move randomness to logic.js`);
      }

      // Timers/RAF in UI (should use tick + RENDER instead)
      if (/\b(setInterval|setTimeout|requestAnimationFrame)\s*\(/.test(txt)) {
        this.warnings.push(`UI timer: ${file} uses timers/RAF — prefer feature.tick and RENDER`);
      }
    }
  }

  // No DOM usage in mutators/logic/selectors
  checkNoDomInMutatorsLogicSelectors() {
    const files = Object.keys(this.currentStructure)
      .filter(p => this.currentStructure[p].type === 'file')
      .filter(p => /^src\/features\/[^/]+\/(mutators|logic|selectors)\.js$/.test(p));

    const domRx = /\b(document|window|createElement|querySelector|getElementById)\b/;

    for (const file of files) {
      const txt = this.readSafe(file);
      if (!txt) continue;
      if (domRx.test(txt)) {
        this.errors.push(`DOM in ${file}. Move DOM to features/<feature>/ui/*.js`);
      }
    }
  }

  // Cross-slice writes outside mutators.js
  checkCrossSliceWrites() {
    const sliceKeys = new Set(this.features);

    // For each feature dir, scan all files except mutators.js
    for (const feat of this.features) {
      const base = `src/features/${feat}/`;
      const files = Object.keys(this.currentStructure)
        .filter(p => this.currentStructure[p].type === 'file')
        .filter(p => p.startsWith(base) && !p.endsWith('/mutators.js'));

      for (const file of files) {
        const txt = this.readSafe(file);
        if (!txt) continue;

        // Detect lines that look like writes to root.<otherSlice>.*
        // Heuristic: root.<name> ... (=|++|--|.push( etc) and <name> !== feat
        const rx = /\broot\.([a-zA-Z0-9_]+)\b[^;\n]*?(=|\+\+|--|\.push\(|\.splice\(|\.pop\(|\.unshift\(|\.shift\()/g;
        let m;
        while ((m = rx.exec(txt)) !== null) {
          const target = m[1];
          if (target !== feat && sliceKeys.has(target)) {
            this.errors.push(`Cross-slice write in ${file}: writes root.${target} (only allowed inside ${target}/mutators.js)`);
            break;
          }
        }
      }
    }
  }

  checkArchitectureDoc() {
    const txt = this.readSafe(this.relAbs(ARCH_FILE));
    if (!txt) return;

    // Must mention app shell & controller
    if (!/src\/ui\/app\.js|app\.js/i.test(txt)) {
      this.errors.push('ARCHITECTURE.md: missing reference to app shell (src/ui/app.js)');
    }
    if (!/GameController/i.test(txt)) {
      this.errors.push('ARCHITECTURE.md: missing reference to GameController loop/tick');
    }

    // Must include Feature Descriptor Contract snippet (key, initialState)
    const hasContract = /export\s+const\s+.+Feature\s*=\s*{[\s\S]*?\bkey\s*:\s*["'][^"']+["'][\s\S]*?\binitialState\s*:\s*\(\s*\)\s*=>/m.test(txt);
    if (!hasContract) {
      this.errors.push('ARCHITECTURE.md: missing Feature Descriptor Contract (key + initialState())');
    }
  }

  // ---------- Auto-update docs ----------

  fixProjectStructureDoc() {
    this.log('\n🛠️ Auto-updating docs/project-structure.md (file tree)…');
    try {
      const current = readFileSync(STRUCTURE_FILE, 'utf8');
      const tree = this.generateFileTree();
      const updated = current.replace(
        /way-of-ascension\/(\r?\n)```[\s\S]*?```/,
        `way-of-ascension/\n${tree}`
      );
      writeFileSync(STRUCTURE_FILE, updated, 'utf8');
      this.log('✅ Updated project-structure.md file tree.');
      // Do not clear all errors—content-level violations should still fail
      this.newFiles = [];
      // Remove only undocumented-file errors, keep others
      this.errors = this.errors.filter(e => !/^UNDOCUMENTED FILE: /.test(e));
    } catch (e) {
      this.errors.push(`Failed to auto-update project-structure.md: ${e.message}`);
      this.log(`❌ ${e.message}`);
    }
  }

  ensureArchitectureDocHasRequiredSections() {
    let changed = false;
    let content = existsSync(ARCH_FILE) ? readFileSync(ARCH_FILE, 'utf8') : '';

    const needApp = !/src\/ui\/app\.js|app\.js/i.test(content);
    const needGC  = !/GameController/i.test(content);
    const needContract = !/export\s+const\s+.+Feature\s*=\s*{[\s\S]*?\bkey\b[\s\S]*?\binitialState\s*:\s*\(\s*\)\s*=>/m.test(content);

    if (needApp || needGC || needContract) {
      changed = true;
      content += `

---

## Appendix: Architecture Contracts (auto-appended by validator)

### App Shell
- **src/ui/app.js** is the only UI bootstrap (create controller, \`registerAllFeatures()\`, mount sidebar/debug, start loop).
- No gameplay logic inside app shell.

### GameController
- Owns the loop, calls feature \`tick(root, dt)\`, emits \`TICK\` and \`RENDER\`.

### Feature Descriptor Contract
\`\`\`js
export const <name>Feature = {
  key: "<sliceKey>",
  initialState: () => ({ ...defaults, _v: 0 }),
  init(root, ctx) {},                // subscribe to events, optional mount
  tick(root, dtMs, now, ctx) {},     // optional
  nav: { id, label, order, visible(root), onSelect(root, ctx) }, // optional
  mount: fn, // temporary bridge until all UIs move to init()
};
\`\`\`
`;
      try {
        writeFileSync(ARCH_FILE, content, 'utf8');
        this.log('✅ Appended required sections to ARCHITECTURE.md.');
        // Remove the specific errors we can now satisfy
        this.errors = this.errors.filter(e =>
          !/ARCHITECTURE\.md: missing reference/.test(e) &&
          !/ARCHITECTURE\.md: missing Feature Descriptor/.test(e)
        );
      } catch (e) {
        this.errors.push(`Failed to update ARCHITECTURE.md: ${e.message}`);
      }
    }
  }

  // ---------- Utilities ----------

  generateFileTree() {
    const root = '```\nway-of-ascension/\n';
    const sorted = Object.keys(this.currentStructure).sort();
    let tree = '';
    // Build a simple ascii tree by levels
    const parts = sorted.filter(p => p && p !== '/');

    // Construct a hierarchy map
    const isDir = p => this.currentStructure[p]?.type === 'directory';
    const children = (dir) =>
      parts.filter(p => p.startsWith(dir) && p !== dir && p.split('/').length === dir.split('/').length + 1);

    const walk = (dir, prefix) => {
      const kids = children(dir);
      kids.forEach((k, i) => {
        const last = i === kids.length - 1;
        const label = k.slice(dir.length);
        tree += `${prefix}${last ? '└── ' : '├── '}${label}\n`;
        if (isDir(k)) walk(k + (k.endsWith('/') ? '' : '/'), prefix + (last ? '    ' : '│   '));
      });
    };
    walk('', '    ');
    return root + tree + '```';
  }

  readSafe(rel) {
    const abs = this.relAbs(rel);
    try { return readFileSync(abs, 'utf8'); } catch { return ''; }
  }

  relAbs(p) {
    if (p.startsWith(PROJECT_ROOT)) return p;
    return join(PROJECT_ROOT, p);
  }
  rel(p) { return p.replace(PROJECT_ROOT + sep, '').replace(/\\/g, '/'); }

  generateReport() {
    const isValid = this.errors.length === 0;

    this.log('\n📋 AI VERIFICATION ENFORCEMENT REPORT');
    this.log('=====================================');
    if (isValid) {
      this.log('✅ VERIFICATION PASSED - AI may proceed');
    } else {
      this.log('❌ VERIFICATION FAILED - MUST fix before proceeding');
      this.log('\n🚨 VIOLATIONS DETECTED:');
      this.errors.forEach(e => this.log(`   • ${e}`));
    }
    if (this.warnings.length > 0) {
      this.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(w => this.log(`   • ${w}`));
    }
    if (this.newFiles.length > 0) {
      this.log('\n📝 REQUIRED ACTION:');
      this.log('   Update docs/project-structure.md with these files:');
      this.newFiles.forEach(f => this.log(`   • ${f}`));
      this.log('\n   Then document their purpose and functions.');
    }
    this.log('\n=====================================');
    if (!isValid) this.log('\n🚫 AI CHANGES BLOCKED UNTIL VALIDATION PASSES');

    writeFileSync(join(PROJECT_ROOT, 'validation.log'), this.logOutput.join('\n'));
    if (!isValid) process.exit(1);

    return {
      valid: isValid,
      errors: this.errors,
      warnings: this.warnings,
      newFiles: this.newFiles
    };
  }
}

// CLI
function isScriptRunDirectly() {
  const scriptPath = normalize(fileURLToPath(import.meta.url));
  const entry = normalize(process.argv[1] || '');
  return scriptPath === entry;
}

if (isScriptRunDirectly()) {
  (async () => {
    const v = new StructureValidator();
    await v.validate();
  })();
}

export { StructureValidator };
