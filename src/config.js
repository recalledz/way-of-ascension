// Unified environment accessor for Node, Vite and browser builds
const env = (typeof import.meta !== 'undefined' && import.meta.env) || process.env;

// Determine Vercel environment with production-safe default and common aliases
const rawEnv = env?.VERCEL_ENV || env?.NODE_ENV || (env?.PROD ? 'production' : '');
const vercelEnv = String(rawEnv || '').toLowerCase();
const envName = ['production', 'prod', 'main'].includes(vercelEnv)
  ? 'production'
  : vercelEnv || 'development';

export const isProd = envName === 'production';
export const isPreview = envName === 'preview';
export const isDev = !isProd && !isPreview;

// Parse env values into booleans/numbers with prod-safe defaults
function parseEnv(name, fallback = false) {
  const val = env?.[name] ?? env?.[`VITE_${name}`];
  if (val === undefined) return fallback;

  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;

  const num = Number(val);
  return Number.isNaN(num) ? fallback : num;
}

export const featureFlags = {
  proficiency: parseEnv('FEATURE_PROFICIENCY'),
  sect: parseEnv('FEATURE_SECT'),
  karma: parseEnv('FEATURE_KARMA'),
  alchemy: parseEnv('FEATURE_ALCHEMY'),
  cooking: parseEnv('FEATURE_COOKING'),
  mining: parseEnv('FEATURE_MINING'),
  gathering: parseEnv('FEATURE_GATHERING'),
  forging: parseEnv('FEATURE_FORGING'),
  physique: parseEnv('FEATURE_PHYSIQUE'),
  agility: parseEnv('FEATURE_AGILITY'),
  law: parseEnv('FEATURE_LAW'),
  mind: parseEnv('FEATURE_MIND'),
  astralTree: parseEnv('FEATURE_ASTRAL_TREE')
};

// Print a summary of active flags in non-production environments
if (!isProd) {
  const active = Object.entries(featureFlags)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
    .join(', ') || 'none';
  console.log(`[flags] active: ${active}`);
}

