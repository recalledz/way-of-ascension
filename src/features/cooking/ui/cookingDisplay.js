import { S } from '../../../shared/state.js';
import { setText, setFill } from '../../../shared/utils/dom.js';
import { on } from '../../../shared/events.js';
import { getCookingYieldBonus } from '../selectors.js';
import { cookMeat, equipFood, useFoodSlot } from '../mutators.js';
import { updateFoodSlots } from './cookControls.js';

export function updateActivityCooking(state = S) {
  if (!state.cooking) {
    state.cooking = { level: 1, exp: 0, expMax: 100, successBonus: 0 };
  }
  setText('cookingLevel', state.cooking.level);
  setText('cookingExp', state.cooking.exp);
  setText('cookingExpMax', state.cooking.expMax);
  const yieldBonus = getCookingYieldBonus(state) * 100;
  setText('cookingYieldBonus', `${yieldBonus}%`);
  setText('currentYieldBonus', yieldBonus);
  const progressFill = document.getElementById('cookingProgressFill');
  if (progressFill) {
    progressFill.style.width = (state.cooking.exp / state.cooking.expMax * 100) + '%';
  }
  const cookButton = document.getElementById('cookMeatButton');
  if (cookButton) {
    cookButton.disabled = (state.meat || 0) === 0;
  }
  updateFoodSlots(state);
}

export function updateCookingSidebar(state = S) {
  if (!state.cooking) return;
  setText('cookingLevelSidebar', `Level ${state.cooking.level}`);
  setFill('cookingProgressFillSidebar', state.cooking.exp / state.cooking.expMax);
  setText('cookingProgressTextSidebar', `${state.cooking.exp} / ${state.cooking.expMax} XP`);
}

export function mountCookingUI(state = S) {
  on('RENDER', () => {
    updateActivityCooking(state);
    updateCookingSidebar(state);
  });
  window.cookMeat = amount => cookMeat(amount, state);
  window.equipFood = (type, slot) => equipFood(type, slot, state);
  window.useFoodSlot = slot => useFoodSlot(slot, state);
  updateActivityCooking(state);
  updateCookingSidebar(state);
}
