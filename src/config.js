// Environment and feature flag utilities

let provider = 'default';
let env = {};
if (typeof import.meta !== 'undefined' && import.meta.env) {
  env = import.meta.env;
  provider = 'import.meta.env';
} else if (typeof process !== 'undefined' && process?.env) {
  env = process.env;
  provider = 'process.env';
} else if (typeof window !== 'undefined' && window.__ENV__) {
  env = window.__ENV__;
  provider = 'window.__ENV__';
}

const modeRaw = String(env.NODE_ENV || env.MODE || '').toLowerCase();
const hasWindow = typeof window !== 'undefined';
const isLocalhost =
  hasWindow && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
let mode = modeRaw;
if (provider === 'window.__ENV__' && !mode) {
  mode = isLocalhost ? 'development' : 'production';
}
export const isProd = mode === 'production';

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
  FEATURE_MIND: false
};

function coerce(value, fallback) {
  if (value === undefined) return fallback;
  const str = String(value).trim().toLowerCase();
  if (str === 'true' || str === '1') return true;
  if (str === 'false' || str === '0') return false;
  if (str === '') return '';
  const num = Number(str);
  if (!Number.isNaN(num)) return num;
  return value;
}

const flags = {};
for (const [name, def] of Object.entries(defaults)) {
  const raw = env?.[name];
  flags[name] = {
    rawValue: raw,
    parsedValue: coerce(raw, def),
    source: raw === undefined ? 'default' : provider
  };
}

if (!isProd && String(env.DEV_UNLOCK_PRESET || '').toLowerCase() === 'all') {
  for (const k of Object.keys(flags)) {
    if (k.startsWith('FEATURE_')) flags[k].parsedValue = true;
  }
}

export const devUnlockPreset = flags.DEV_UNLOCK_PRESET.parsedValue;

export const featureFlags = {
  cultivation: true,
  proficiency: flags.FEATURE_PROFICIENCY.parsedValue,
  sect: flags.FEATURE_SECT.parsedValue,
  karma: flags.FEATURE_KARMA.parsedValue,
  alchemy: flags.FEATURE_ALCHEMY.parsedValue,
  cooking: flags.FEATURE_COOKING.parsedValue,
  mining: flags.FEATURE_MINING.parsedValue,
  gathering: flags.FEATURE_GATHERING.parsedValue,
  forging: flags.FEATURE_FORGING.parsedValue,
  physique: flags.FEATURE_PHYSIQUE.parsedValue,
  agility: flags.FEATURE_AGILITY.parsedValue,
  catching: flags.FEATURE_CATCHING.parsedValue,
  law: flags.FEATURE_LAW.parsedValue,
  mind: flags.FEATURE_MIND.parsedValue
};

export function configReport() {
  const missingKeys = Object.entries(flags)
    .filter(([, v]) => v.source === 'default')
    .map(([k]) => k);
  const allKnownKeysFound = missingKeys.length === 0;

  const bundler = typeof import.meta !== 'undefined' && import.meta?.env
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
    flags,
    allKnownKeysFound,
    missingKeys
  };
}
