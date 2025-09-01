import { S } from '../../../shared/state.js';
import { qCap, qiRegenPerSec, fCap } from '../selectors.js';
import { setText, setFill } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';
import { updateQiOrbEffect } from './qiOrb.js';

export function updateQiAndFoundation(state = S) {
  const cap = qCap(state);
  setText('qiVal', fmt(state.qi));
  setText('qiCap', fmt(cap));
  setText('qiValL', fmt(state.qi));
  setText('qiCapL', fmt(cap));
  setText('qiRegen', qiRegenPerSec(state).toFixed(1));
  setFill('qiFill', state.qi / cap);
  setFill('qiFill2', state.qi / cap);
  setText('qiPct', Math.floor(100 * state.qi / cap) + '%');

  setFill('cultivationProgressFill', state.foundation / fCap(state));
  setText('cultivationProgressText', `${fmt(state.foundation)} / ${fmt(fCap(state))}`);
  setText('foundValL', fmt(state.foundation));
  setText('foundCapL', fmt(fCap(state)));
  setFill('foundFill', state.foundation / fCap(state));
  setFill('foundFill2', state.foundation / fCap(state));
  setText('foundPct', Math.floor(100 * state.foundation / fCap(state)) + '%');

  updateQiOrbEffect();
}
