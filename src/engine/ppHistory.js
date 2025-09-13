import { getCurrentPP } from './pp.js';

const SAMPLE_INTERVAL = 30; // seconds
const MAX_SAMPLES = 360;

export function initPPRolling(state) {
  if (!state.ppHistory) {
    state.ppHistory = { samples: [], startedAt: state.time || 0, lastAt: state.time || 0 };
    return;
  }
  const ph = state.ppHistory;
  if (!ph.samples) ph.samples = [];
  if (!ph.startedAt) ph.startedAt = state.time || 0;
  if (!ph.lastAt) ph.lastAt = state.time || 0;
}

export function tickPPSampler(state) {
  initPPRolling(state);
  const ph = state.ppHistory;
  if (state.time - ph.lastAt < SAMPLE_INTERVAL) return;
  ph.lastAt = state.time;
  const { PP } = getCurrentPP(state);
  ph.samples.push(PP);
  if (ph.samples.length > MAX_SAMPLES) {
    ph.samples.splice(0, ph.samples.length - MAX_SAMPLES);
  }
}

export function avgPP(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function getAverages(state) {
  const ph = state.ppHistory;
  if (!ph || ph.samples.length === 0) {
    return { lastHour: 0, sinceStart: 0 };
  }
  const samples = ph.samples;
  const lastHourSamples = samples.slice(-120); // 3600 / 30 = 120
  return {
    lastHour: avgPP(lastHourSamples),
    sinceStart: avgPP(samples),
  };
}
