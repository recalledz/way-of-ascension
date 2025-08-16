/**
 * AI VERIFICATION ENFORCEMENT SYSTEM
 * 
 * This script MUST be run by every AI assistant before making ANY changes.
 * Failure to run this will result in incomplete documentation and broken project structure.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const PROJECT_ROOT = process.cwd();
const DOCS_PATH = join(PROJECT_ROOT, 'docs');
const STRUCTURE_FILE = join(DOCS_PATH, 'project-structure.md');

/**
 * MANDATORY: Run this before any code changes
 * @returns {Promise<{valid: boolean, errors: string[], warnings: string[]}>}
 */
export async function enforceVerificationProtocol() {
  console.log('🤖 RUNNING MANDATORY AI VERIFICATION PROTOCOL...');
  
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    newFiles: [],
    missingFiles: []
  };

  // Step 1: Verify project-structure.md exists and is readable
  if (!existsSync(STRUCTURE_FILE)) {
    results.errors.push('CRITICAL: docs/project-structure.md not found!');
    results.valid = false;
    return results;
  }

  // Step 2: Scan current project structure
  const currentStructure = scanProjectStructure();
  
  // Step 3: Parse documented structure
  const documentedStructure = parseDocumentedStructure();
  
  // Step 4: Find discrepancies
  const { newFiles, missingFiles, outdatedFiles } = compareStructures(currentStructure, documentedStructure);
  
  if (newFiles.length > 0) {
    results.errors.push(`UNDOCUMENTED FILES FOUND: ${newFiles.join(', ')}`);
    results.newFiles = newFiles;
    results.valid = false;
  }
  
  if (missingFiles.length > 0) {
    results.warnings.push(`DOCUMENTED FILES MISSING: ${missingFiles.join(', ')}`);
    results.missingFiles = missingFiles;
  }
  
  if (outdatedFiles.length > 0) {
    results.warnings.push(`FILES NEED DOCUMENTATION UPDATE: ${outdatedFiles.join(', ')}`);
  }

  // Step 5: Verify core files exist
  const coreFiles = [
    'src/game/state.js',
    'src/game/engine.js', 
    'src/game/adventure.js',
    'ui/index.js',
    'ui/realm.js',
    'index.html',
    'style.css',
    'docs/ai-verification-protocol.md'
  ];

  const missingCoreFiles = coreFiles.filter(file => !existsSync(join(PROJECT_ROOT, file)));
  if (missingCoreFiles.length > 0) {
    results.errors.push(`MISSING CORE FILES: ${missingCoreFiles.join(', ')}`);
    results.valid = false;
  }

  // Step 6: Generate enforcement report
  generateEnforcementReport(results);
  
  return results;
}

/**
 * Scans the actual project structure
 */
function scanProjectStructure() {
  const structure = {};
  const ignoreDirs = ['node_modules', '.git', '.windsurf'];
  
  function scanDir(dirPath, relativePath = '') {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      if (ignoreDirs.includes(item)) continue;
      
      const fullPath = join(dirPath, item);
      const relPath = join(relativePath, item);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        structure[relPath + '/'] = { type: 'directory', size: 0 };
        scanDir(fullPath, relPath);
      } else {
        structure[relPath] = { 
          type: 'file', 
          size: stats.size,
          ext: item.split('.').pop()
        };
      }
    }
  }
  
  scanDir(PROJECT_ROOT);
  return structure;
}

/**
 * Parses the documented structure from project-structure.md
 */
function parseDocumentedStructure() {
  const content = readFileSync(STRUCTURE_FILE, 'utf8');
  const documented = {};
  
  // Extract file tree from markdown
  const treeMatch = content.match(/```\nway-of-ascension\/\n([\s\S]*?)\n```/);
  if (!treeMatch) return documented;
  
  const lines = treeMatch[1].split('\n');
  for (const line of lines) {
    const match = line.match(/[├└│\s]*([^\s├└│]+)/);
    if (match) {
      const fileName = match[1];
      if (fileName.includes('/') || fileName.includes('.')) {
        documented[fileName] = { documented: true };
      }
    }
  }
  
  return documented;
}

/**
 * Compares current vs documented structure
 */
function compareStructures(current, documented) {
  const currentFiles = Object.keys(current).filter(f => current[f].type === 'file');
  const documentedFiles = Object.keys(documented);
  
  const newFiles = currentFiles.filter(f => !documentedFiles.includes(f));
  const missingFiles = documentedFiles.filter(f => !currentFiles.includes(f));
  const outdatedFiles = []; // Could add logic to detect files that need doc updates
  
  return { newFiles, missingFiles, outdatedFiles };
}

/**
 * Generates enforcement report
 */
function generateEnforcementReport(results) {
  console.log('\n📋 AI VERIFICATION ENFORCEMENT REPORT');
  console.log('=====================================');
  
  if (results.valid) {
    console.log('✅ VERIFICATION PASSED - You may proceed with changes');
  } else {
    console.log('❌ VERIFICATION FAILED - MUST fix issues before proceeding');
    console.log('\n🚨 CRITICAL ERRORS:');
    results.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(warning => console.log(`   • ${warning}`));
  }
  
  if (results.newFiles.length > 0) {
    console.log('\n📝 ACTION REQUIRED: Update project-structure.md with these new files:');
    results.newFiles.forEach(file => console.log(`   • ${file}`));
  }
  
  console.log('\n=====================================\n');
}

/**
 * MANDATORY PRE-CHANGE VALIDATION
 * Every AI assistant MUST call this before making changes
 */
export async function validateBeforeChanges() {
  const results = await enforceVerificationProtocol();
  
  if (!results.valid) {
    throw new Error(`
🚨 AI VERIFICATION PROTOCOL VIOLATION 🚨

You MUST fix these issues before making any changes:
${results.errors.join('\n')}

Required actions:
1. Update docs/project-structure.md with new files
2. Document file purposes and functions
3. Re-run verification protocol
4. Only proceed when validation passes

This enforcement prevents project structure corruption.
    `);
  }
  
  return results;
}

// Auto-run verification when this module is imported
if (import.meta.url === `file://${process.argv[1]}`) {
  enforceVerificationProtocol().then(results => {
    process.exit(results.valid ? 0 : 1);
  });
}
