/** @typedef {{
 *  key: string,
 *  element: string|null,
 *  baseDurationSec: number,
 *  maxStacks: number,
 *  tickRate: number,
 *  scaleStat?: string,
 *  scaleFactor?: number,
 *  onApply?: (ctx: any) => void,
 *  onExpire?: (ctx: any) => void,
 * }} AilmentDef */

/** @type {Record<string, AilmentDef>} */
export const AILMENTS = {
  poison: {
    key: 'poison',
    element: 'wood',
    baseDurationSec: 6,
    maxStacks: 20,
    tickRate: 1,
    scaleStat: 'mind',
  },
  burn: {
    key: 'burn',
    element: 'fire',
    baseDurationSec: 4,
    maxStacks: 1,
    tickRate: 1,
    scaleStat: 'mind',
  },
  chill: {
    key: 'chill',
    element: 'water',
    baseDurationSec: 8,
    maxStacks: 5,
    tickRate: 0,
    scaleStat: 'mind',
    onApply: ({ target, stack }) => {
      if (stack >= 5 && target) target.frozen = true;
    },
    onExpire: ({ target }) => {
      if (target) target.frozen = false;
    },
  },
  entomb: {
    key: 'entomb',
    element: 'earth',
    baseDurationSec: 5,
    maxStacks: 1,
    tickRate: 0,
    onApply: ({ target }) => {
      if (target) target.immobilized = true;
    },
    onExpire: ({ target }) => {
      if (target) target.immobilized = false;
    },
  },
  ionize: {
    key: 'ionize',
    element: 'metal',
    baseDurationSec: 5,
    maxStacks: 1,
    tickRate: 0,
    onApply: ({ target }) => {
      if (target) target.armorModifier = (target.armorModifier ?? 0) - 0.1;
    },
    onExpire: ({ target }) => {
      if (target) target.armorModifier = (target.armorModifier ?? 0) + 0.1;
    },
  },
};

export const AILMENT_KEYS = Object.keys(AILMENTS);

export function getAilment(key) {
  return AILMENTS[key];
}
