import { on, emit } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { getKarmaPoints, getKarmaBonuses } from '../selectors.js';

// Fallback upgrade data in case a global definition is not provided.
// Each upgrade defines a key (used for storing the level in state),
// display info, cost parameters and an effect function that mutates the
// provided state when purchased.
const defaultUpgrades = [
  {
    key: 'kQiRegen',
    name: 'Qi Flow',
    desc: 'Increase Qi regeneration by 10%',
    base: 10,
    mult: 1.5,
    eff: state => { state.karma.qiRegen = (state.karma.qiRegen || 0) + 0.1; },
  },
  {
    key: 'kAtk',
    name: 'Attack',
    desc: 'Increase attack by 10%',
    base: 10,
    mult: 1.5,
    eff: state => { state.karma.atk = (state.karma.atk || 0) + 0.1; },
  },
  {
    key: 'kDef',
    name: 'Defense',
    desc: 'Increase defense by 10%',
    base: 10,
    mult: 1.5,
    eff: state => { state.karma.def = (state.karma.def || 0) + 0.1; },
  },
];

const KARMA_UPS = globalThis.KARMA_UPS || defaultUpgrades;

function render(state){
  const bonuses = getKarmaBonuses(state);
  setText('karmaPoints', getKarmaPoints(state));
  setText('karmaAtkBonus', `${(bonuses.atk * 100).toFixed(0)}%`);
  setText('karmaDefBonus', `${(bonuses.def * 100).toFixed(0)}%`);
  setText('karmaQiRegenBonus', `${(bonuses.qiRegen * 100).toFixed(0)}%`);

  const body = document.getElementById('karmaUpgrades');
  if (body) {
    body.innerHTML = '';
    KARMA_UPS.forEach(k => {
      const level = state.karma?.[k.key.slice(2)] || 0;
      const cost = k.base * Math.pow(k.mult, level);
      const div = document.createElement('div');
      div.innerHTML = `<button class="btn small" data-karma="${k.key}">${k.name}</button><div class="muted">${k.desc}</div><div class="muted">Cost: ${Math.floor(cost)} karma</div>`;
      body.appendChild(div);
    });
  }
}

export function mountKarmaUI(state){
  const body = document.getElementById('karmaUpgrades');
  if (body) {
    body.addEventListener('click', e => {
      const key = e.target?.dataset?.karma;
      if (!key) return;
      const upgrade = KARMA_UPS.find(x => x.key === key);
      if (!upgrade) return;
      const level = state.karma?.[key.slice(2)] || 0;
      const cost = upgrade.base * Math.pow(upgrade.mult, level);
      if (getKarmaPoints(state) >= cost) {
        state.karma.points -= cost;
        upgrade.eff?.(state);
        render(state);
        emit('RENDER');
      }
    });
  }

  on('RENDER', () => render(state));
  render(state);
}
