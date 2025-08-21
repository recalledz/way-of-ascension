import { S } from '../../../shared/state.js';
import { calcAtk, calcDef } from '../../progression/selectors.js';
import { setText } from '../../../shared/utils/dom.js';

export function updateCombatStats(state = S) {
  setText('atkVal', calcAtk(state));
  setText('defVal', calcDef(state));
  setText('armorVal', state.stats?.armor || 0);
  setText('accuracyVal', state.stats?.accuracy || 0);
  setText('dodgeVal', state.stats?.dodge || 0);
  setText('atkVal2', calcAtk(state));
  setText('defVal2', calcDef(state));
  setText('armorVal2', state.stats?.armor || 0);
  setText('accuracyVal2', state.stats?.accuracy || 0);
  setText('dodgeVal2', state.stats?.dodge || 0);
}
