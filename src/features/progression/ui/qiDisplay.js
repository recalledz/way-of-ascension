import { S } from '../../../shared/state.js';
import { qCap, qiRegenPerSec, fCap } from '../selectors.js';
import { setText, setFill } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';
import { updateQiOrbEffect } from './qiOrb.js';

export function updateQiAndFoundation(state = S) {
  const qiRegen = qiRegenPerSec(state);
  setText('qiVal', fmt(state.qi));
  setText('qiCap', fmt(qCap(state)));
  setText('qiValL', fmt(state.qi));
  setText('qiCapL', fmt(qCap(state)));
  setText('qiRegen', qiRegen.toFixed(1));
  setFill('qiFill', state.qi / qCap(state));
  setFill('qiFill2', state.qi / qCap(state));
  setText('qiPct', Math.floor(100 * state.qi / qCap(state)) + '%');

  setFill('cultivationProgressFill', state.foundation / fCap(state));
  setText('cultivationProgressText', `${fmt(state.foundation)} / ${fmt(fCap(state))}`);
  setText('foundValL', fmt(state.foundation));
  setText('foundCapL', fmt(fCap(state)));
  setFill('foundFill', state.foundation / fCap(state));
  setFill('foundFill2', state.foundation / fCap(state));
  setText('foundPct', Math.floor(100 * state.foundation / fCap(state)) + '%');

  updateQiOrbEffect();
}
