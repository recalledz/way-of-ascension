import { S } from '../../../shared/state.js';
import { calcAtk } from '../../progression/selectors.js';
import { setText, setFill } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';

export function updateCombatStats(state = S) {
  setText('atkVal', calcAtk(state));
  setText('armorVal', state.stats?.armor || 0);
  setText('accuracyVal', state.stats?.accuracy || 0);
  setText('dodgeVal', state.stats?.dodge || 0);
  setText('atkVal2', calcAtk(state));
  setText('armorVal2', state.stats?.armor || 0);
  setText('accuracyVal2', state.stats?.accuracy || 0);
  setText('dodgeVal2', state.stats?.dodge || 0);

  // HP & Shield HUD (moved here to avoid duplicate updates in ui/index.js)
  setText('hpVal', fmt(state.hp));
  setText('hpMax', fmt(state.hpMax));
  setText('hpValL', fmt(state.hp));
  setText('hpMaxL', fmt(state.hpMax));
  setFill('hpFill', state.hpMax > 0 ? state.hp / state.hpMax : 0);
  setFill('shieldFill', state.shield?.max ? state.shield.current / state.shield.max : 0);
}
