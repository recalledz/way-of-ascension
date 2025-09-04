import { config } from 'dotenv';
import path from 'path';

const inputEnv = process.env.NODE_ENV || 'development';
const env = ['production', 'prod', 'main'].includes(inputEnv) ? 'production' : inputEnv;

// Ensure downstream code treats "main" and "prod" as production
config({ path: path.resolve(`.env.${env}`), override: true });
process.env.NODE_ENV = env;
process.env.VERCEL_ENV = process.env.VERCEL_ENV || env;

await import('../server.js');
