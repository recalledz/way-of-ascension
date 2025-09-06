// Environment and feature flag utilities

const hasImportMeta = typeof import.meta !== 'undefined' && !!import.meta.env;
const hasProcess = typeof process !== 'undefined';
const hasRuntimeEnv = typeof window !== 'undefined' && !!window.__ENV__;
const env = hasImportMeta
  ? import.meta.env
  : hasProcess
  ? process.env
  : hasRuntimeEnv
  ? window.__ENV__
  : {};

// Determine mode and source
const rawEnv = env?.VERCEL_ENV || env?.NODE_ENV || (env?.PROD ? 'production' : '');
const modeSrc = env?.VERCEL_ENV
  ? 'VERCEL_ENV'
  : env?.NODE_ENV
  ? 'NODE_ENV'
  : env?.PROD
  ? 'import.meta.env.PROD'
  : 'default';
const vercelEnv = String(rawEnv || '').toLowerCase();
const mode = ['production', 'prod', 'main'].includes(vercelEnv)
  ? 'production'
  : vercelEnv || 'development';

export const isProd = mode === 'production';
export const isPreview = mode === 'preview';
export const isDev = !isProd && !isPreview;

// Coerce env values
function coerce(value, fallback) {
  if (value === undefined) return fallback;
  const str = String(value).toLowerCase();
  if (str === 'true' || str === '1') return true;
  if (str === 'false' || str === '0') return false;
  const num = Number(value);
  if (!Number.isNaN(num)) return num;
  return value;
}

function readFlag(name, fallback) {
  const order = [
    { prefix: 'VITE_', source: 'VITE', provider: hasImportMeta ? import.meta.env : undefined },
    { prefix: 'NEXT_PUBLIC_', source: 'NEXT_PUBLIC', provider: hasProcess ? process.env : undefined },
    { prefix: 'REACT_APP_', source: 'REACT_APP', provider: hasProcess ? process.env : undefined },
    { prefix: '', source: 'RUNTIME', provider: hasRuntimeEnv ? window.__ENV__ : undefined }
  ];

  for (const { prefix, source, provider } of order) {
    const key = prefix + name;
    if (provider && Object.prototype.hasOwnProperty.call(provider, key)) {
      const raw = provider[key];
      return { rawValue: raw, parsedValue: coerce(raw, fallback), source };
    }
  }
  return { rawValue: undefined, parsedValue: fallback, source: 'default' };
}

const flagNames = [
  'TUTORIALS_ENABLED',
  'DEV_UNLOCK_PRESET',
  'DISCOVERY_RATE_MULT',
  'TIMERS_SPEED_MULT',
  'FEATURE_PROFICIENCY',
  'FEATURE_SECT',
  'FEATURE_KARMA',
  'FEATURE_ALCHEMY',
  'FEATURE_COOKING',
  'FEATURE_MINING',
  'FEATURE_GATHERING',
  'FEATURE_FORGING',
  'FEATURE_PHYSIQUE',
  'FEATURE_AGILITY',
  'FEATURE_CATCHING',
  'FEATURE_LAW',
  'FEATURE_MIND',
];

const flags = {};
for (const name of flagNames) {
  const fallback = name.startsWith('FEATURE_') ? false : undefined;
  flags[name] = readFlag(name, fallback);
}

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
  mind: flags.FEATURE_MIND.parsedValue,
};

export const devUnlockPreset = flags.DEV_UNLOCK_PRESET.parsedValue;

export function configReport() {
  const missingKeys = Object.entries(flags)
    .filter(([, v]) => v.source === 'default')
    .map(([k]) => k);
  const allKnownKeysFound = missingKeys.length === 0;

  const envProvider = hasImportMeta
    ? 'vite import.meta.env'
    : hasProcess
    ? 'process.env'
    : hasRuntimeEnv
    ? 'window.__ENV__'
    : 'unknown';

  let bundlerGuess = 'unknown';
  const envKeys = Object.keys(env || {});
  const hasVite = envKeys.some((k) => k.startsWith('VITE_'));
  const hasNext = envKeys.some((k) => k.startsWith('NEXT_PUBLIC_'));
  const hasCra = envKeys.some((k) => k.startsWith('REACT_APP_'));
  if (hasImportMeta) bundlerGuess = 'vite';
  else if (hasNext) bundlerGuess = 'next';
  else if (hasCra) bundlerGuess = 'cra';

  const warnings = [];
  if (bundlerGuess === 'vite') {
    if (hasNext || hasCra) warnings.push('Mixing VITE_* with other prefixes');
    for (const key of missingKeys) {
      if (envKeys.includes('NEXT_PUBLIC_' + key)) {
        warnings.push(`Expected VITE_${key} but NEXT_PUBLIC_${key} is set`);
      }
      if (envKeys.includes('REACT_APP_' + key)) {
        warnings.push(`Expected VITE_${key} but REACT_APP_${key} is set`);
      }
    }
  }
  if (bundlerGuess === 'next') {
    if (hasCra || hasVite) warnings.push('Mixing NEXT_PUBLIC_* with other prefixes');
  }
  if (bundlerGuess === 'cra') {
    if (hasNext || hasVite) warnings.push('Mixing REACT_APP_* with other prefixes');
  }

  return {
    mode,
    modeSource: modeSrc,
    isProd,
    envProvider,
    bundlerGuess,
    warnings,
    flags,
    allKnownKeysFound,
    missingKeys
  };
}
