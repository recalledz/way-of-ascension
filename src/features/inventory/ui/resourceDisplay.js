import { S } from '../../../shared/state.js';
import { setText } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';

export function updateResourceDisplay(state = S) {
  setText('stonesDisplay', fmt(state.stones));
  setText('stonesVal', fmt(state.stones));
  setText('stonesValL', fmt(state.stones));
  setText('herbVal', fmt(state.herbs));
  setText('oreVal', fmt(state.ore));
  setText('woodVal', fmt(state.wood));
  setText('spiritWoodVal', fmt(state.spiritWood));
  setText('coreVal', fmt(state.cores));
  setText('pillQi', state.pills.qi);
  setText('pillBody', state.pills.body);
  setText('pillWard', state.pills.ward);
}
