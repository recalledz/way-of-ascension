import { config } from 'dotenv';
import path from 'path';

const inputEnv = process.env.NODE_ENV || 'development';
const env = ['production', 'prod', 'main'].includes(inputEnv) ? 'production' : inputEnv;
config({ path: path.resolve(`.env.${env}`) });

await import('../server.js');
