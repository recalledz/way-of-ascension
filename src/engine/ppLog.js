import { computePP, gatherDefense, W_O } from './pp.js';

/**
 * Log a Power Points event. `meta.before` can include a pre-change
 * snapshot from computePP(state, gatherDefense(state)).
 *
 * @param {object} state
 * @param {string} kind
 * @param {object} [meta]
 */
export function logPPEvent(state, kind, meta = {}) {
  if (!state) return;
  const before = meta.before;
  const after = computePP(state, gatherDefense(state));
  const afterTotal = W_O * after.OPP + after.DPP;
  let diff;
  if (before) {
    const beforeTotal = W_O * before.OPP + before.DPP;
    diff = {
      OPP: after.OPP - before.OPP,
      DPP: after.DPP - before.DPP,
      PP: afterTotal - beforeTotal,
    };
  }
  const entry = {
    time: Date.now(),
    kind,
    meta: { ...meta, before: undefined },
    before,
    after: { ...after, PP: afterTotal },
    diff,
  };
  state.ppLog = state.ppLog || [];
  state.ppLog.push(entry);
}

/**
 * Trigger a download of the PP log as CSV.
 * @param {object} state
 */
export function downloadPPLogCSV(state) {
  const log = state.ppLog || [];
  const rows = [
    'time,kind,PP,OPP,DPP,deltaPP,deltaOPP,deltaDPP,meta'
  ];
  for (const e of log) {
    const { time, kind, after, diff, meta } = e;
    rows.push([
      new Date(time).toISOString(),
      kind,
      after?.PP ?? '',
      after?.OPP ?? '',
      after?.DPP ?? '',
      diff?.PP ?? '',
      diff?.OPP ?? '',
      diff?.DPP ?? '',
      JSON.stringify(meta || {})
    ].join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pp-log.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default { logPPEvent, downloadPPLogCSV };
