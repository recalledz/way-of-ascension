// Unified environment accessor with diagnostics support
const env = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof process !== 'undefined' && process.env) || {};

// Determine mode and provider
const envProvider = typeof import.meta !== 'undefined' && import.meta.env
  ? 'vite import.meta.env'
  : (typeof process !== 'undefined' && process.env ? 'process.env' : 'unknown');

const rawMode = env?.VERCEL_ENV || env?.NODE_ENV || (env?.PROD ? 'production' : '');
let modeSource = 'default';
if (env?.VERCEL_ENV) modeSource = 'VERCEL_ENV';
else if (env?.NODE_ENV) modeSource = 'NODE_ENV';
else if (env?.PROD !== undefined) modeSource = 'PROD';
const normalized = String(rawMode || '').toLowerCase();
const mode = ['production', 'prod', 'main'].includes(normalized) ? 'production' : 'development';

export const isProd = mode === 'production';
export const isPreview = normalized === 'preview';
export const isDev = !isProd && !isPreview;

// Helpers --------------------------------------------------------------
function readRaw(name) {
  let rawValue;
  let source = 'default';
  const foundKeys = [];

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${name}`;
    if (import.meta.env[viteKey] !== undefined) {
      rawValue = import.meta.env[viteKey];
      source = viteKey;
    }
    if (import.meta.env[viteKey] !== undefined) foundKeys.push(viteKey);
  }

  if (typeof process !== 'undefined' && process.env) {
    const nextKey = `NEXT_PUBLIC_${name}`;
    const craKey = `REACT_APP_${name}`;
    if (process.env[nextKey] !== undefined) {
      if (source === 'default') { rawValue = process.env[nextKey]; source = nextKey; }
      foundKeys.push(nextKey);
    }
    if (process.env[craKey] !== undefined) {
      if (source === 'default') { rawValue = process.env[craKey]; source = craKey; }
      foundKeys.push(craKey);
    }
  }

  return { rawValue, source, foundKeys };
}

function coerce(value, fallback) {
  if (value === undefined) return fallback;
  const v = String(value).trim();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  const num = Number(v);
  if (!Number.isNaN(num)) return num;
  return v;
}

const defaults = {
  TUTORIALS_ENABLED: true,
  DEV_UNLOCK_PRESET: '',
  DISCOVERY_RATE_MULT: 1,
  TIMERS_SPEED_MULT: 1,
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
  FEATURE_LAW: false,
  FEATURE_MIND: false,
  FEATURE_ASTRAL_TREE: false
};

function readFlag(name) {
  const { rawValue } = readRaw(name);
  return coerce(rawValue, defaults[name]);
}

export const TUTORIALS_ENABLED = readFlag('TUTORIALS_ENABLED');
export const DEV_UNLOCK_PRESET = readFlag('DEV_UNLOCK_PRESET');
export const DISCOVERY_RATE_MULT = readFlag('DISCOVERY_RATE_MULT');
export const TIMERS_SPEED_MULT = readFlag('TIMERS_SPEED_MULT');

const featureNames = [
  ['FEATURE_PROFICIENCY', 'proficiency'],
  ['FEATURE_SECT', 'sect'],
  ['FEATURE_KARMA', 'karma'],
  ['FEATURE_ALCHEMY', 'alchemy'],
  ['FEATURE_COOKING', 'cooking'],
  ['FEATURE_MINING', 'mining'],
  ['FEATURE_GATHERING', 'gathering'],
  ['FEATURE_FORGING', 'forging'],
  ['FEATURE_PHYSIQUE', 'physique'],
  ['FEATURE_AGILITY', 'agility'],
  ['FEATURE_LAW', 'law'],
  ['FEATURE_MIND', 'mind'],
  ['FEATURE_ASTRAL_TREE', 'astralTree']
];

export const featureFlags = Object.fromEntries(
  featureNames.map(([envName, key]) => [key, readFlag(envName)])
);

// Bundler guess --------------------------------------------------------
let bundlerGuess = 'unknown';
if (typeof import.meta !== 'undefined' && import.meta.env) {
  bundlerGuess = 'vite';
} else if (typeof process !== 'undefined' && process.env) {
  const keys = Object.keys(process.env);
  if (keys.some(k => k.startsWith('NEXT_PUBLIC_'))) bundlerGuess = 'next';
  else if (keys.some(k => k.startsWith('REACT_APP_'))) bundlerGuess = 'cra';
}

// Report ---------------------------------------------------------------
export function configReport() {
  const flagNames = [
    'TUTORIALS_ENABLED',
    'DEV_UNLOCK_PRESET',
    'DISCOVERY_RATE_MULT',
    'TIMERS_SPEED_MULT',
    ...featureNames.map(([envName]) => envName)
  ];

  const flags = {};
  const missingKeys = [];
  const warnings = [];

  for (const name of flagNames) {
    const { rawValue, source, foundKeys } = readRaw(name);
    const parsedValue = coerce(rawValue, defaults[name]);
    flags[name] = { rawValue: rawValue ?? null, parsedValue, source };
    if (source === 'default') missingKeys.push(name);

    if (bundlerGuess === 'vite') {
      if (!source.startsWith('VITE_')) {
        if (source !== 'default') warnings.push(`Expected VITE_${name} but found ${source}`);
        else if (foundKeys.some(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('REACT_APP_')))
          warnings.push(`Missing VITE_${name} but found ${foundKeys.join(', ')}`);
      }
    } else if (bundlerGuess === 'next') {
      if (!source.startsWith('NEXT_PUBLIC_')) {
        if (source !== 'default') warnings.push(`Expected NEXT_PUBLIC_${name} but found ${source}`);
        else if (foundKeys.some(k => k.startsWith('VITE_') || k.startsWith('REACT_APP_')))
          warnings.push(`Missing NEXT_PUBLIC_${name} but found ${foundKeys.join(', ')}`);
      }
    } else if (bundlerGuess === 'cra') {
      if (!source.startsWith('REACT_APP_')) {
        if (source !== 'default') warnings.push(`Expected REACT_APP_${name} but found ${source}`);
        else if (foundKeys.some(k => k.startsWith('VITE_') || k.startsWith('NEXT_PUBLIC_')))
          warnings.push(`Missing REACT_APP_${name} but found ${foundKeys.join(', ')}`);
      }
    }
  }

  return {
    mode,
    modeSource,
    isProd,
    envProvider,
    bundlerGuess,
    flags,
    allKnownKeysFound: missingKeys.length === 0,
    missingKeys,
    warnings
  };
}
