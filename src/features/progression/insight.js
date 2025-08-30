import { foundationGainPerSec } from './selectors.js';

const S_BASE = 0.06;
const ACTIVITY_MULTIPLIER = {
  cultivation: 0.5,
  other: 0.1,
  idle: 0,
};

export function tickInsight(state, dtSec = 1) {
  const FGR_pm = foundationGainPerSec(state) * 60;
  const activities = state.activities || {};
  let A = ACTIVITY_MULTIPLIER.idle;
  if (activities.cultivation) {
    A = ACTIVITY_MULTIPLIER.cultivation;
  } else if (Object.values(activities).some(Boolean)) {
    A = ACTIVITY_MULTIPLIER.other;
  }
  const pctBonus = (state.astralTreeBonuses?.insightGainPct || 0) / 100;
  const insightRatePm = FGR_pm * S_BASE * A * (1 + pctBonus);
  const delta = (insightRatePm / 60) * dtSec;
  state.astralPoints = (state.astralPoints || 0) + delta;
}
