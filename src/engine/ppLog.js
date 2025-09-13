import { getCurrentPP } from './pp.js';

/**
 * Record a Power Points snapshot for a given event.
 * @param {object} state - game state
 * @param {string} kind - event type
 * @param {object} [meta={}] - additional metadata
 */
export function logPPEvent(state, kind, meta = {}) {
  if (!state) return;
  state.ppLog = state.ppLog || [];
  const { OPP, DPP, PP } = getCurrentPP(state);
  state.ppLog.push({
    ts: Date.now(),
    kind,
    OPP,
    DPP,
    PP,
    meta,
  });
}

/**
 * Download the Power Points log as a CSV file.
 * @param {object} state - game state
 */
export function downloadPPLogCSV(state) {
  const rows = state?.ppLog || [];
  let csv = 'timestamp,kind,OPP,DPP,PP,meta\n';
  csv += rows
    .map(r => {
      const meta = JSON.stringify(r.meta || {});
      return `${new Date(r.ts).toISOString()},${r.kind},${r.OPP},${r.DPP},${r.PP},${meta}`;
    })
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pp-log.csv';
  a.click();
  URL.revokeObjectURL(url);
}
