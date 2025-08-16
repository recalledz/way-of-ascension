#!/usr/bin/env node

/**
 * PRE-COMMIT HOOK FOR AI VERIFICATION ENFORCEMENT
 * 
 * This hook automatically runs before any AI makes changes to ensure
 * documentation is always up to date.
 */

import { validateBeforeChanges } from './ai-enforcement.js';

async function preCommitHook() {
  console.log('🔍 Running AI verification pre-commit hook...');
  
  try {
    const results = await validateBeforeChanges();
    
    if (results.newFiles.length > 0) {
      console.log('⚠️  New files detected - documentation update required');
      console.log('Run: npm run update-docs');
      process.exit(1);
    }
    
    console.log('✅ Pre-commit verification passed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Pre-commit verification failed:');
    console.error(error.message);
    process.exit(1);
  }
}

preCommitHook();
