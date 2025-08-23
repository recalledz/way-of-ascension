import { log } from '../../shared/utils/dom.js';

export function getFoodSlotData(state) {
  if (!state.foodSlots) {
    state.foodSlots = {
      slot1: null,
      slot2: null,
      slot3: null,
      lastUsed: 0,
      cooldown: 5000,
    };
  }
  return {
    meat: state.meat || 0,
    cookedMeat: state.cookedMeat || 0,
    cookAmountMax: state.meat || 0,
  };
}

export function cookMeat(amount, state) {
  const parsed = Number(amount);
  if (!Number.isInteger(parsed) || parsed < 1) {
    console.warn(`Invalid cook amount: ${amount}`);
    return;
  }
  const availableMeat = state.meat || 0;
  const amt = Math.min(parsed, availableMeat);
  if (amt < 1) {
    log('Not enough raw meat!', 'bad');
    return;
  }
  const yieldBonus = (state.cooking.level - 1) * 0.1;
  let cookedAmount = amt;
  for (let i = 0; i < amt; i++) {
    if (Math.random() < yieldBonus) cookedAmount++;
  }
  state.meat -= amt;
  state.cookedMeat = (state.cookedMeat || 0) + cookedAmount;
  const expGain = amt * 10;
  state.cooking.exp += expGain;
  while (state.cooking.exp >= state.cooking.expMax) {
    state.cooking.exp -= state.cooking.expMax;
    state.cooking.level++;
    state.cooking.expMax = Math.floor(state.cooking.expMax * 1.2);
    log(`Cooking level increased to ${state.cooking.level}!`, 'good');
  }
  const bonusText = cookedAmount > amt ? ` (+${cookedAmount - amt} bonus)` : '';
  log(`Cooked ${amt} meat into ${cookedAmount} cooked meat${bonusText}!`, 'good');
}

export function equipFood(foodType, slotNumber, state) {
  if (!state.foodSlots) {
    state.foodSlots = {
      slot1: null,
      slot2: null,
      slot3: null,
      lastUsed: 0,
      cooldown: 5000,
    };
  }
  const slotKey = `slot${slotNumber}`;
  if (foodType === 'meat' && (state.meat || 0) === 0) {
    log('No raw meat to equip!', 'bad');
    return;
  }
  if (foodType === 'cookedMeat' && (state.cookedMeat || 0) === 0) {
    log('No cooked meat to equip!', 'bad');
    return;
  }
  state.foodSlots[slotKey] = foodType;
  log(`Equipped ${foodType === 'meat' ? 'raw meat' : 'cooked meat'} to slot ${slotNumber}!`, 'good');
}

export function useFoodSlot(slotNumber, state) {
  if (!state.foodSlots) return;
  const slotKey = `slot${slotNumber}`;
  const foodType = state.foodSlots[slotKey];
  if (!foodType) {
    log('No food equipped in this slot!', 'bad');
    return;
  }
  const now = Date.now();
  if (now - state.foodSlots.lastUsed < state.foodSlots.cooldown) {
    const remaining = Math.ceil((state.foodSlots.cooldown - (now - state.foodSlots.lastUsed)) / 1000);
    log(`Food is on cooldown! ${remaining}s remaining.`, 'bad');
    return;
  }
  if (foodType === 'meat' && (state.meat || 0) === 0) {
    log('No raw meat available!', 'bad');
    return;
  }
  if (foodType === 'cookedMeat' && (state.cookedMeat || 0) === 0) {
    log('No cooked meat available!', 'bad');
    return;
  }
  if (state.hp >= state.hpMax) {
    log('HP is already full!', 'bad');
    return;
  }
  let healAmount = 0;
  if (foodType === 'meat') {
    state.meat--;
    healAmount = 20;
  } else if (foodType === 'cookedMeat') {
    state.cookedMeat--;
    healAmount = 40;
  }
  const oldHP = state.hp;
  state.hp = Math.min(state.hpMax, state.hp + healAmount);
  const actualHeal = state.hp - oldHP;
  state.foodSlots.lastUsed = now;
  log(`Used ${foodType === 'meat' ? 'raw meat' : 'cooked meat'} and restored ${actualHeal} HP!`, 'good');
  if (state.adventure && state.adventure.inCombat) {
    state.adventure.playerHP = state.hp;
  }
}
