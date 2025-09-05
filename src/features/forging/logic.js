import { S } from '../../shared/state.js';
import { log } from '../../shared/utils/dom.js';
import { getAgilityEffects } from '../agility/logic.js';
import { getBuildingBonuses } from '../sect/selectors.js';

export function getForgingTime(tier, state = S) {
  const baseMinutes = tier === 0 ? 1 : Math.pow(3, tier + 1);
  const level = state.forging?.level || 1;
  const reduction = Math.pow(0.95, Math.max(0, level - 1));
  const { forgeSpeed } = getAgilityEffects(state);
  const buildingSpeed = 1 + (getBuildingBonuses(state).imbuementSpeed || 0);
  return baseMinutes * 60 * reduction / (forgeSpeed * buildingSpeed);
}

export function startForging(itemId, element, state = S) {
  if (!state.forging) return;
  const item = state.inventory?.find(it => String(it.id) === String(itemId));
  if (!item) { log?.('Item not found', 'bad'); return; }
  const tier = item.tier || 0;
  const woodCost = (tier + 1) * 10;
  const stoneCost = (tier + 1) * 5;
  const qiCost = (tier + 1) * 10;
  if ((state.wood || 0) < woodCost || (state.stones || 0) < stoneCost || (state.qi || 0) < qiCost) {
    log?.('Not enough resources', 'bad');
    return;
  }
  state.wood -= woodCost;
  state.stones -= stoneCost;
  state.qi -= qiCost;
  state.forging.current = {
    itemId: String(itemId),
    element,
    targetTier: tier + 1,
    time: getForgingTime(tier, state),
  };
  log?.(`Started forging ${item.name || item.id} (${element}) to tier ${tier + 1}`, 'good');
}

export function advanceForging(state = S) {
  if (!state.activities?.forging || !state.forging?.current) return;
  const job = state.forging.current;
  job.time -= 1;
  if (job.time <= 0) {
    const item = state.inventory?.find(it => String(it.id) === job.itemId);
    if (item) {
      item.element = job.element;
      item.tier = job.targetTier;
      log?.(`Finished forging ${item.name || item.id} to tier ${item.tier}`, 'good');
    }
    state.forging.exp += 10;
    while (state.forging.exp >= state.forging.expMax) {
      state.forging.exp -= state.forging.expMax;
      state.forging.level += 1;
      state.forging.expMax = Math.floor(state.forging.expMax * 1.2);
      log?.(`Forging level up! Level ${state.forging.level}`, 'good');
    }
    state.forging.current = null;
    if (state.activities) state.activities.forging = false;
  }
}

export function imbueItem(itemId, element, state = S) {
  const item = state.inventory?.find(it => String(it.id) === String(itemId));
  if (!item) { log?.('Item not found', 'bad'); return; }
  const tier = item.imbuement?.tier || 0;
  const woodCost = (tier + 1) * 20;
  const stoneCost = (tier + 1) * 10;
  if ((state.wood || 0) < woodCost || (state.stones || 0) < stoneCost) {
    log?.('Not enough resources', 'bad');
    return;
  }
  state.wood -= woodCost;
  state.stones -= stoneCost;
  item.imbuement = { element, tier: tier + 1 };
  log?.(`Imbued ${item.name || item.id} with ${element} to tier ${tier + 1}`, 'good');
}
