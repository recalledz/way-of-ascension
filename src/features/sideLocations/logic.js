import { on } from '../../shared/events.js';
import { log } from '../../shared/utils/dom.js';

const DISCOVERY_COOLDOWN_MS = 60 * 60 * 1000;
const BASE_CHANCE = 0.10;

const STAGE_DISCOVERIES = {
  '0-1': [{ type: 'mining', resource: 'iron', name: 'Iron Ore Deposit' }],
  '0-4': [{ type: 'gathering', resource: 'herbs', name: 'Herb Garden' }],
};

export function initSideLocations(state) {
  // Ensure previously discovered nodes are available on load
  state.sideLocations?.discovered?.forEach(r => {
    if (STAGE_DISCOVERIES['0-1'][0].resource === r) {
      state.mining.unlockedResources = state.mining.unlockedResources || ['stones'];
      if (!state.mining.unlockedResources.includes(r)) state.mining.unlockedResources.push(r);
    }
    if (STAGE_DISCOVERIES['0-4'][0].resource === r) {
      state.gathering.unlockedResources = state.gathering.unlockedResources || ['wood'];
      if (!state.gathering.unlockedResources.includes(r)) state.gathering.unlockedResources.push(r);
    }
  });

  on('ADVENTURE:KILL', ({ zone, area }) => {
    handleKill(state, zone, area);
  });
}

function handleKill(state, zone, area) {
  if (!state.sideLocations) return;
  const now = Date.now();
  if (now - (state.sideLocations.lastDiscovery || 0) < DISCOVERY_COOLDOWN_MS) return;
  const chance = Math.max(0, BASE_CHANCE - area * 0.01);
  if (Math.random() >= chance) return;
  const key = `${zone}-${area}`;
  const pool = STAGE_DISCOVERIES[key];
  if (!pool || pool.length === 0) return;
  const pick = pool[0];
  if (state.sideLocations.discovered.includes(pick.resource)) return;
  state.sideLocations.discovered.push(pick.resource);
  state.sideLocations.lastDiscovery = now;
  if (pick.type === 'mining') {
    state.mining.unlockedResources = state.mining.unlockedResources || ['stones'];
    if (!state.mining.unlockedResources.includes(pick.resource)) {
      state.mining.unlockedResources.push(pick.resource);
    }
  } else if (pick.type === 'gathering') {
    state.gathering.unlockedResources = state.gathering.unlockedResources || ['wood'];
    if (!state.gathering.unlockedResources.includes(pick.resource)) {
      state.gathering.unlockedResources.push(pick.resource);
    }
  }
  log?.(`You discovered a ${pick.name}!`, 'excellent');
}
