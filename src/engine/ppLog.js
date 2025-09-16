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

function formatStageEnemySummary(stages) {
  const fmt = value => (typeof value === 'number' ? value.toFixed(2) : '--');
  return stages
    .map(entry => {
      const parts = [];
      if (entry.stage === 1) {
        if (entry.boss) {
          parts.push(
            `Stage 1 Boss (${entry.boss.name}): OPP ${fmt(entry.boss.OPP)} / DPP ${fmt(entry.boss.DPP)}`
          );
        } else {
          parts.push('Stage 1 Boss: n/a');
        }
      } else {
        if (entry.enemy) {
          parts.push(
            `Stage ${entry.stage} Enemy (${entry.enemy.name}): OPP ${fmt(entry.enemy.OPP)} / DPP ${fmt(entry.enemy.DPP)}`
          );
        } else {
          parts.push(`Stage ${entry.stage} Enemy: n/a`);
        }
        if (entry.boss) {
          parts.push(
            `Stage ${entry.stage} Boss (${entry.boss.name}): OPP ${fmt(entry.boss.OPP)} / DPP ${fmt(entry.boss.DPP)}`
          );
        } else {
          parts.push(`Stage ${entry.stage} Boss: n/a`);
        }
      }
      return parts.join(' | ');
    })
    .join(' || ');
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
  const stageSummary = formatStageEnemySummary(stageEnemyPowerReferences());
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
    'stageEnemyPower',
  ];
  const rows = [header.join(',')];
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
      stageSummary,
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
