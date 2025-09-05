import { SECT_BUILDINGS } from './data/buildings.js';

export function getBuildingCost(key, level){
  const b = SECT_BUILDINGS[key];
  if(!b) return null;
  const cost = {};
  for(const [res, amt] of Object.entries(b.baseCost)){
    cost[res] = Math.floor(amt * Math.pow(b.costScaling, level - 1));
  }
  return cost;
}

export function canUpgrade(buildings, resources, progression, key){
  const b = SECT_BUILDINGS[key];
  if(!b) return false;
  const level = buildings[key] || 0;
  if(level >= b.maxLevel) return false;
  const req = b.unlockReq;
  if(progression){
    const { realm } = progression;
    if(realm.tier < req.realm) return false;
    if(realm.tier === req.realm && realm.stage < req.stage) return false;
  }
  const cost = getBuildingCost(key, level + 1);
  for(const [res, amt] of Object.entries(cost)){
    if((resources[res] || 0) < amt) return false;
  }
  return true;
}

export function calculateBonuses(buildings){
  const bonuses = {
    cookingSuccess: 0,
    cookingSpeed: 0,
    alchemySlots: 0,
    alchemySuccess: 0,
    imbuementSpeed: 0
  };
  for(const [key, level] of Object.entries(buildings)){
    const b = SECT_BUILDINGS[key];
    if(!b) continue;
    for(let i=1;i<=level;i++){
      const eff = b.effects[i];
      if(!eff) continue;
      for(const [k,v] of Object.entries(eff)){
        if(k === 'desc' || k.endsWith('Unlock')) continue;
        bonuses[k] = (bonuses[k] || 0) + v;
      }
    }
  }
  return bonuses;
}
