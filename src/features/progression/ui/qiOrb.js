/* Update Qi Orb visual effect based on foundation level */

import { S } from '../../../shared/state.js';
import { fCap } from '../selectors.js';

export function updateQiOrbEffect() {
  const qiOrb = document.getElementById('qiOrb');
  if (!qiOrb) return;

  const isFoundationMax = S.foundation >= fCap(S) * 0.99;

  if (isFoundationMax) {
    qiOrb.classList.add('foundation-max');
  } else {
    qiOrb.classList.remove('foundation-max');
  }
}

