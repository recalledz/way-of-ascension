import { S } from '../../../shared/state.js';
import { setText } from '../../../shared/utils/dom.js';
import { getFoodSlotData } from '../logic.js';

export function updateFoodSlots(state = S) {
  const data = getFoodSlotData(state);
  setText('rawMeatCount', data.meat);
  setText('inventoryRawMeat', data.meat);
  setText('inventoryCookedMeat', data.cookedMeat);
  setText('inventoryRawMeatAdventure', data.meat);
  setText('inventoryCookedMeatAdventure', data.cookedMeat);
  const cookInput = document.getElementById('cookAmount');
  if (cookInput) {
    cookInput.max = data.cookAmountMax;
    if (parseInt(cookInput.value) > data.cookAmountMax) {
      cookInput.value = Math.max(1, data.cookAmountMax);
    }
  }
}
