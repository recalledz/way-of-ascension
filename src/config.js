export const isProd = process.env.NODE_ENV === 'production';

export const featureFlags = {
  proficiency: process.env.FEATURE_PROFICIENCY !== 'false',
  sect: process.env.FEATURE_SECT !== 'false',
  karma: process.env.FEATURE_KARMA !== 'false',
  alchemy: process.env.FEATURE_ALCHEMY !== 'false',
  cooking: process.env.FEATURE_COOKING !== 'false',
  mining: process.env.FEATURE_MINING !== 'false',
  gathering: process.env.FEATURE_GATHERING !== 'false',
  forging: process.env.FEATURE_FORGING !== 'false',
  physique: process.env.FEATURE_PHYSIQUE !== 'false',
  agility: process.env.FEATURE_AGILITY !== 'false',
  law: process.env.FEATURE_LAW !== 'false',
  mind: process.env.FEATURE_MIND !== 'false',
  astralTree: process.env.FEATURE_ASTRAL_TREE !== 'false'
};
