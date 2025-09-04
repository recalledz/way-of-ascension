import { config } from 'dotenv';
import path from 'path';

const inputEnv = process.env.NODE_ENV || 'development';

// Load environment variables for the original input
config({ path: path.resolve(`.env.${inputEnv}`), override: true });

// Normalize environment name so "main" and "prod" map to production
const envName = ['production', 'prod', 'main'].includes(inputEnv)
  ? 'production'
  : inputEnv;

// Ensure downstream code treats aliases as production
process.env.NODE_ENV = envName;
process.env.VERCEL_ENV = envName;

await import('../server.js');
