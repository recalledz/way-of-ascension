#!/usr/bin/env node

/**
 * AUTOMATED PROJECT STRUCTURE VALIDATOR
 * 
 * This script enforces the AI verification protocol automatically.
 * Run this before any AI assistant makes changes.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
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
    this.documentedFiles = new Set();
  }

  async validate() {
    console.log('🤖 ENFORCING AI VERIFICATION PROTOCOL...\\n');
    
    if (!this.verifyDocumentationExists()) {
      return this.generateReport();
    }
    
    this.scanCurrentStructure();
    this.parseDocumentedStructure();
    this.findViolations();
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
      const lines = content.split('\\n');
      let inFileTree = false;
      
      for (const line of lines) {
        if (line.includes('way-of-ascension/')) {
          inFileTree = true;
          continue;
        }
        
        if (inFileTree && line.trim() === '```') {
          break;
        }
        
        if (inFileTree) {
          const match = line.match(/[├└│\\s]*([^\\s├└│#]+)/);
          if (match) {
            let fileName = match[1];
            if (fileName.includes('.') || fileName.endsWith('/')) {
              fileName = fileName.replace(/\\/$/, '');
              this.documentedFiles.add(fileName);
            }
          }
        }
      }
    } catch {
      this.errors.push('Cannot parse project-structure.md');
    }
  }

  findViolations() {
    const currentFiles = Object.keys(this.currentStructure)
      .filter(f => this.currentStructure[f].type === 'file')
      .map(f => f.replace(/\\/g, '/'));
    
    for (const file of currentFiles) {
      if (this.shouldIgnoreFile(file)) continue;
      
      const isDocumented = Array.from(this.documentedFiles).some(docFile => {
        return file === docFile || file.endsWith('/' + docFile) || docFile.includes(file);
      });
      
      if (!isDocumented) {
        this.newFiles.push(file);
        this.errors.push(\`UNDOCUMENTED FILE: \${file}\`);
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
        this.errors.push(\`MISSING CORE FILE: \${coreFile}\`);
      }
    }
  }

  shouldIgnoreFile(file) {
    const ignorePatterns = [
      /package-lock\\.json$/,
      /\\.log$/,
      /\\.tmp$/,
      /\\.cache$/,
      /eslint\\.config\\./,
      /\\.windsurf\\//
    ];
    
    return ignorePatterns.some(pattern => pattern.test(file));
  }

  generateReport() {
    const isValid = this.errors.length === 0;
    
    console.log('📋 AI VERIFICATION ENFORCEMENT REPORT');
    console.log('=====================================');
    
    if (isValid) {
      console.log('✅ VERIFICATION PASSED - AI may proceed');
    } else {
      console.log('❌ VERIFICATION FAILED - MUST fix before proceeding');
      console.log('\\n🚨 VIOLATIONS DETECTED:');
      this.errors.forEach(error => console.log(\`   • \${error}\`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(\`   • \${warning}\`));
    }
    
    if (this.newFiles.length > 0) {
      console.log('\\n📝 REQUIRED ACTION:');
      console.log('   Update docs/project-structure.md with these files:');
      this.newFiles.forEach(file => console.log(\`   • \${file}\`));
      console.log('\\n   Then document their purpose and functions.');
    }
    
    console.log('\\n=====================================');
    
    if (!isValid) {
      console.log('\\n🚫 AI CHANGES BLOCKED UNTIL DOCUMENTATION UPDATED');
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