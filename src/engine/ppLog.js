import { computePP, gatherDefense, W_O } from './pp.js';
import { enemyPP } from './enemyPP.js';
import { ENEMY_DATA } from '../features/adventure/data/enemies.js';
import { ZONES } from '../features/adventure/data/zones.js';

const STAGE_REFERENCE_LIMIT = 5;

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (!/[",\n]/.test(str)) return str;
  return '"' + str.replace(/"/g, '""') + '"';
}

function stageEnemyPowerReferences(limit = STAGE_REFERENCE_LIMIT) {
  const stages = [];
  for (let stage = 1; stage <= limit; stage++) {
    const zone = ZONES[stage - 1];
    const entry = { stage };
    if (!zone) {
      stages.push(entry);
      continue;
    }
    const firstEnemyArea = zone.areas?.find(area => !area.isBoss);
    const bossArea = zone.areas?.find(area => area.isBoss);
    const readEnemyPower = enemyKey => {
      if (!enemyKey) return null;
      const data = ENEMY_DATA[enemyKey];
      if (!data) return null;
      const power = enemyPP(data);
      return {
        name: data.name || enemyKey,
        OPP: power.E_OPP,
        DPP: power.E_DPP,
      };
    };
    if (stage > 1) {
      entry.enemy = readEnemyPower(firstEnemyArea?.enemy);
    }
    entry.boss = readEnemyPower(bossArea?.enemy);
    stages.push(entry);
  }
  return stages;
}

function buildStageReferenceColumns(limit = STAGE_REFERENCE_LIMIT) {
  const stages = stageEnemyPowerReferences(limit);
  const columns = [];
  const fmtNumber = value =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : '';
  const fmtName = name => (name ? name : 'n/a');
  const addEntityColumns = (prefix, entity) => {
    columns.push({ header: `${prefix}Name`, value: fmtName(entity?.name) });
    columns.push({ header: `${prefix}OPP`, value: fmtNumber(entity?.OPP) });
    columns.push({ header: `${prefix}DPP`, value: fmtNumber(entity?.DPP) });
  };

  for (const entry of stages) {
    const stageLabel = `stage${entry.stage}`;
    if (entry.stage === 1) {
      addEntityColumns(`${stageLabel}Boss`, entry.boss);
    } else {
      addEntityColumns(`${stageLabel}Enemy`, entry.enemy);
      addEntityColumns(`${stageLabel}Boss`, entry.boss);
    }
  }

  return columns;
}

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
  const stageReferenceColumns = buildStageReferenceColumns();
  const header = [
    'time',
    'kind',
    'PP',
    'OPP',
    'DPP',
    'deltaPP',
    'deltaOPP',
    'deltaDPP',
    'meta',
    ...stageReferenceColumns.map(column => column.header),
  ];
  const rows = [header.map(csvEscape).join(',')];
  const stageReferenceValues = stageReferenceColumns.map(column => column.value);
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
      JSON.stringify(meta || {}),
      ...stageReferenceValues,
    ].map(csvEscape).join(','));
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
