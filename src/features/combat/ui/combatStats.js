import { S } from '../../../shared/state.js';
import { calculatePlayerCombatAttack } from '../../progression/selectors.js';
import { setText, setFill } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';

export function updateCombatStats(state = S) {
  const profile = calculatePlayerCombatAttack(state);
  const totalAtk = Math.round(
    profile.phys + Object.values(profile.elems || {}).reduce((a, b) => a + b, 0)
  );
  setText('atkVal', totalAtk);
  setText('armorVal', state.derivedStats?.armor || 0);
  setText('accuracyVal', state.derivedStats?.accuracy || 0);
  setText('dodgeVal', state.derivedStats?.dodge || 0);
  setText('atkVal2', totalAtk);
  setText('armorVal2', state.derivedStats?.armor || 0);
  setText('accuracyVal2', state.derivedStats?.accuracy || 0);
  setText('dodgeVal2', state.derivedStats?.dodge || 0);

  // HP & Shield HUD (moved here to avoid duplicate updates in ui/index.js)
  setText('hpVal', fmt(state.hp));
  setText('hpMax', fmt(state.hpMax));
  setText('hpValL', fmt(state.hp));
  setText('hpMaxL', fmt(state.hpMax));
  setFill('hpFill', state.hpMax > 0 ? state.hp / state.hpMax : 0);
  setFill('shieldFill', state.shield?.max ? state.shield.current / state.shield.max : 0);
}
