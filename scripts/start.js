import { config } from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
config({ path: path.resolve(`.env.${env}`) });

await import('../server.js');
