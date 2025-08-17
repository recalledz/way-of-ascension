#!/usr/bin/env node

/**
 * AUTOMATED PROJECT STRUCTURE VALIDATOR
 * 
 * This script enforces the AI verification protocol automatically.
 * Run this before any AI assistant makes changes.
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname, normalize } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const STRUCTURE_FILE = join(PROJECT_ROOT, 'docs', 'project-structure.md');

class StructureValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.newFiles = [];
    this.currentStructure = {};
    this.autoUpdate = process.argv.includes('--auto-update');
    this.documentedFiles = new Set();
    this.logOutput = [];
  }

  log(message) {
    this.logOutput.push(message);
    console.log(message);
  }

  async validate() {
    this.log('🤖 ENFORCING AI VERIFICATION PROTOCOL...');
    
    if (!this.verifyDocumentationExists()) {
      return this.generateReport();
    }
    
    this.scanCurrentStructure();
    this.parseDocumentedStructure();
    this.findViolations();

    if (this.autoUpdate && this.newFiles.length > 0) {
      return this.fixDocumentation();
    }

    return this.generateReport();
  }

  verifyDocumentationExists() {
    if (!existsSync(STRUCTURE_FILE)) {
      this.errors.push('CRITICAL: docs/project-structure.md missing!');
      return false;
    }
    return true;
  }

  scanCurrentStructure() {
    const ignoreDirs = ['node_modules', '.git', 'browser-tools-mcp'];
    const importantExtensions = ['.js', '.md', '.html', '.css', '.json'];
    
    const scanDir = (dirPath, relativePath = '') => {
      try {
        const items = readdirSync(dirPath);
        
        for (const item of items) {
          if (ignoreDirs.includes(item)) continue;
          
          const fullPath = join(dirPath, item);
          const relPath = join(relativePath, item).replace(/\\/g, '/');
          const stats = statSync(fullPath);
          
          if (stats.isDirectory()) {
            this.currentStructure[relPath + '/'] = { type: 'directory' };
            scanDir(fullPath, relPath);
          } else {
            const ext = '.' + item.split('.').pop();
            if (importantExtensions.includes(ext)) {
              this.currentStructure[relPath] = { 
                type: 'file', 
                size: stats.size,
                ext: ext
              };
            }
          }
        }
      } catch {
        this.warnings.push(`Cannot scan directory: ${dirPath}`);
      }
    };
    
    scanDir(PROJECT_ROOT);
  }

  parseDocumentedStructure() {
    try {
      const content = readFileSync(STRUCTURE_FILE, 'utf8');
      const lines = content.split(/\r?\n/);
      let inFileTree = false;
      const pathStack = [];

      for (const line of lines) {
        if (line.includes('way-of-ascension/')) {
          inFileTree = true;
          continue;
        }
        if (inFileTree && line.trim() === '```') break;
        if (!inFileTree) continue;

        const depthMatch = line.match(/^[│\s]*/);
        const depth = depthMatch ? depthMatch[0].length / 4 : 0;

        const nameMatch = line.match(/[├└]──\s*([^\s#]+)/);
        if (!nameMatch) continue;

        const name = nameMatch[1];

        pathStack.splice(depth);
        pathStack.push(name.replace(/\/$/, ''));

        const currentPath = pathStack.join('/');
        this.documentedFiles.add(currentPath);
      }
    } catch (e) {
      this.errors.push(`Cannot parse project-structure.md: ${e.message}`);
    }
  }

  findViolations() {
    const currentFiles = Object.keys(this.currentStructure)
      .filter(f => this.currentStructure[f].type === 'file')
      .map(f => f.replace(/\\/g, '/'));
    
    for (const file of currentFiles) {
      if (this.shouldIgnoreFile(file)) continue;
      
      const isDocumented = this.documentedFiles.has(file);
      
      if (!isDocumented) {
        this.newFiles.push(file);
        this.errors.push(`UNDOCUMENTED FILE: ${file}`);
      }
    }
    
    const coreFiles = [
      'src/game/state.js',
      'src/game/engine.js',
      'src/game/adventure.js',
      'ui/index.js',
      'index.html',
      'docs/ai-verification-protocol.md'
    ];
    
    for (const coreFile of coreFiles) {
      if (!currentFiles.includes(coreFile)) {
        this.errors.push(`MISSING CORE FILE: ${coreFile}`);
      }
    }
  }

  shouldIgnoreFile(file) {
    const ignorePatterns = [
      /package-lock\.json$/,
      /\.log$/,
      /\.tmp$/,
      /\.cache$/,
      /eslint\.config\./,
      /\.windsurf\//
    ];
    
    return ignorePatterns.some(pattern => pattern.test(file));
  }

  fixDocumentation() {
    this.log('\n🛠️ AUTO-FIXING DOCUMENTATION...');
    try {
      const currentContent = readFileSync(STRUCTURE_FILE, 'utf8');
      const newFileTree = this.generateFileTree();
      const updatedContent = currentContent.replace(
        /way-of-ascension\/(\r?\n)```[\s\S]*?```/,
        `way-of-ascension/\n${newFileTree}`
      );

      writeFileSync(STRUCTURE_FILE, updatedContent);
      this.log('✅ Successfully updated project-structure.md.');
      this.errors = [];
      this.newFiles = [];
    } catch (e) {
      this.errors.push(`Failed to auto-fix documentation: ${e.message}`);
      this.log(`❌ ${e.message}`);
    }
    return this.generateReport();
  }

  generateFileTree() {
    const root = 'way-of-ascension/';
    let tree = '```\n' + root + '\n';
    const structure = this.currentStructure;
    const sortedPaths = Object.keys(structure).sort();

    const processed = new Set();

    const buildTree = (dir, prefix) => {
      const items = sortedPaths.filter(p => p.startsWith(dir) && p !== dir && p.split('/').length === dir.split('/').length);
      
      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const name = item.substring(dir.length);

        tree += `${prefix}${connector}${name}\n`;
        processed.add(item);

        if (structure[item].type === 'directory') {
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          buildTree(item, newPrefix);
        }
      });
    };

    buildTree('', '    ');

    return tree + '```';
  }

  generateReport() {
    const isValid = this.errors.length === 0;
    
    this.log('\n📋 AI VERIFICATION ENFORCEMENT REPORT');
    this.log('=====================================');
    
    if (isValid) {
      this.log('✅ VERIFICATION PASSED - AI may proceed');
    } else {
      this.log('❌ VERIFICATION FAILED - MUST fix before proceeding');
      this.log('\n🚨 VIOLATIONS DETECTED:');
      this.errors.forEach(error => this.log(`   • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      this.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => this.log(`   • ${warning}`));
    }
    
    if (this.newFiles.length > 0) {
      this.log('\n📝 REQUIRED ACTION:');
      this.log('   Update docs/project-structure.md with these files:');
      this.newFiles.forEach(file => this.log(`   • ${file}`));
      this.log('\n   Then document their purpose and functions.');
    }
    
    this.log('\n=====================================');
    
    if (!isValid) {
      this.log('\n🚫 AI CHANGES BLOCKED UNTIL DOCUMENTATION UPDATED');
    }

    writeFileSync(join(PROJECT_ROOT, 'validation.log'), this.logOutput.join('\n'));

    if (!isValid) {
      process.exit(1);
    }
    
    return {
      valid: isValid,
      errors: this.errors,
      warnings: this.warnings,
      newFiles: this.newFiles
    };
  }
}

// CLI interface
function isScriptRunDirectly() {
    const scriptPath = normalize(fileURLToPath(import.meta.url));
    const entryPoint = normalize(process.argv[1]);
    return scriptPath === entryPoint;
}

if (isScriptRunDirectly()) {
    (async () => {
        const validator = new StructureValidator();
        await validator.validate();
    })();
}

export { StructureValidator };