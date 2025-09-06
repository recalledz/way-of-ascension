// Environment and feature flag utilities

// Detect environment provider
const hasImportMeta = typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined';
const hasProcess = typeof process !== 'undefined' && typeof process.env !== 'undefined';
const hasWindowEnv = typeof window !== 'undefined' && typeof window.__ENV__ !== 'undefined';

const env = hasImportMeta
  ? import.meta.env
  : hasProcess
  ? process.env
  : hasWindowEnv
  ? window.__ENV__
  : {};

export const provider = hasImportMeta
  ? 'import.meta.env'
  : hasProcess
  ? 'process.env'
  : hasWindowEnv
  ? 'window.__ENV__'
  : 'default';

// Determine mode
let mode = String(env.NODE_ENV || env.MODE || '').toLowerCase();

let isLocalhost = false;
if (typeof window !== 'undefined' && window.location) {
  const host = window.location.hostname;
  isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(host);
}

if (provider === 'window.__ENV__' && !mode) {
  mode = isLocalhost ? 'development' : 'production';
}

export const isProd = mode === 'production';

// Coerce env values
function coerce(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const str = String(value).toLowerCase();
  if (str === 'true' || str === '1') return true;
  if (str === 'false' || str === '0') return false;
  const num = Number(value);
  if (!Number.isNaN(num)) return num;
  return value;
}

// Default flag values (safe for production)
const defaults = {
  TUTORIALS_ENABLED: false,
  DEV_UNLOCK_PRESET: '',
  DISCOVERY_RATE_MULT: 1,
  TIMERS_SPEED_MULT: 1,
  // default locked in prod; gameplay unlocks them via progression/buildings
  FEATURE_PROFICIENCY: false,
  FEATURE_SECT: false,
  FEATURE_KARMA: false,
  FEATURE_ALCHEMY: false,
  FEATURE_COOKING: false,
  FEATURE_MINING: false,
  FEATURE_GATHERING: false,
  FEATURE_FORGING: false,
  FEATURE_PHYSIQUE: false,
  FEATURE_AGILITY: false,
  FEATURE_CATCHING: false,
  FEATURE_LAW: false,
  FEATURE_MIND: false,
};

function readEnv(name) {
  const variants = [name, `VITE_${name}`, `NEXT_PUBLIC_${name}`, `REACT_APP_${name}`];
  for (const key of variants) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      return env[key];
    }
  }
  return undefined;
}

const flags = {};
const flagInfo = {};
for (const [name, def] of Object.entries(defaults)) {
  const raw = readEnv(name);
  const parsed = coerce(raw, def);
  flags[name] = parsed;
  flagInfo[name] = {
    rawValue: raw !== undefined ? raw : def,
    parsedValue: parsed,
    source: raw !== undefined ? provider : 'default',
  };
}

const preset = String(flags.DEV_UNLOCK_PRESET || '').toLowerCase();
if (!isProd && preset === 'all') {
  for (const key of Object.keys(flags)) {
    if (key.startsWith('FEATURE_')) {
      flags[key] = true;
      if (flagInfo[key]) flagInfo[key].parsedValue = true;
    }
  }
}

export const featureFlags = {
  cultivation: true,
  proficiency: flags.FEATURE_PROFICIENCY,
  sect: flags.FEATURE_SECT,
  karma: flags.FEATURE_KARMA,
  alchemy: flags.FEATURE_ALCHEMY,
  cooking: flags.FEATURE_COOKING,
  mining: flags.FEATURE_MINING,
  gathering: flags.FEATURE_GATHERING,
  forging: flags.FEATURE_FORGING,
  physique: flags.FEATURE_PHYSIQUE,
  agility: flags.FEATURE_AGILITY,
  catching: flags.FEATURE_CATCHING,
  law: flags.FEATURE_LAW,
  mind: flags.FEATURE_MIND,
};

export const devUnlockPreset = flags.DEV_UNLOCK_PRESET;

export function configReport() {
  const missingKeys = Object.entries(flagInfo)
    .filter(([, v]) => v.source === 'default')
    .map(([k]) => k);
  const allKnownKeysFound = missingKeys.length === 0;

  const bundler = import.meta?.env
    ? 'vite'
    : typeof process !== 'undefined' && process?.versions?.node
    ? 'node'
    : typeof window !== 'undefined'
    ? 'browser'
    : 'unknown';

  return {
    isProd,
    mode,
    provider,
    bundler,
    flags: flagInfo,
    allKnownKeysFound,
    missingKeys,
  };
}

