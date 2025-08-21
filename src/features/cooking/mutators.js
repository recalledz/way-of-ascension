import { S } from '../../shared/state.js';
import { cookMeat as logicCookMeat, equipFood as logicEquipFood, useFoodSlot as logicUseFoodSlot } from './logic.js';
import { updateFoodSlots } from './ui/cookControls.js';

export function cookMeat(amount, state = S) {
  logicCookMeat(amount, state);
  updateFoodSlots(state);
}

export function equipFood(foodType, slot, state = S) {
  logicEquipFood(foodType, slot, state);
}

export function useFoodSlot(slot, state = S) {
  logicUseFoodSlot(slot, state);
  updateFoodSlots(state);
}
