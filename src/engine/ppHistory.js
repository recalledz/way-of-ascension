import { getCurrentPP } from './pp.js';

export function initPPRolling(state){
  state.ppHistory = state.ppHistory || { samples: [], startedAt: 0, lastAt: 0 };
  if(!state.ppHistory.startedAt){
    const now = Date.now();
    state.ppHistory.startedAt = now;
    state.ppHistory.lastAt = now;
    state.ppHistory.samples = [];
  }
}

export function tickPPSampler(state){
  if(!state.ppHistory || !state.ppHistory.startedAt){
    initPPRolling(state);
  }
  const now = Date.now();
  if(now - state.ppHistory.lastAt < 30000){
    return;
  }
  const { PP } = getCurrentPP(state);
  state.ppHistory.samples.push({ at: now, pp: PP });
  state.ppHistory.lastAt = now;
  if(state.ppHistory.samples.length > 360){
    state.ppHistory.samples.splice(0, state.ppHistory.samples.length - 360);
  }
}

export function avgPP(samples){
  if(!samples || samples.length === 0) return 0;
  const total = samples.reduce((sum, s) => sum + (s.pp || 0), 0);
  return total / samples.length;
}

export function getAverages(state){
  if(!state.ppHistory) return { lastHour: 0, sinceStart: 0 };
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const samples = state.ppHistory.samples || [];
  const lastHourSamples = samples.filter(s => s.at >= oneHourAgo);
  return {
    lastHour: avgPP(lastHourSamples),
    sinceStart: avgPP(samples),
  };
}
