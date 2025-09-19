import { SECT_BUILDINGS } from '../data/buildings.js';
import { getBuildingLevel } from '../selectors.js';
import { getBuildingCost, canUpgrade } from '../logic.js';
import { upgradeBuilding } from '../mutators.js';
import { REALMS } from '../../progression/data/realms.js';
import { on } from '../../../shared/events.js';
import { log } from '../../../shared/utils/dom.js';
import { updateActivitySelectors } from '../../activity/ui/activityUI.js';

function meetsRequirement(realm, req) {
  if (!req) return true;
  if (!realm) return false;
  if (realm.tier > req.realm) return true;
  if (realm.tier < req.realm) return false;
  return (realm.stage || 1) >= req.stage;
}

function formatRequirement(req) {
  if (!req) return '';
  const realmName = REALMS[req.realm]?.name || `Realm ${req.realm}`;
  return `${realmName} ${req.stage}`;
}

function createCostItems(cost, state) {
  const wrapper = document.createElement('div');
  wrapper.className = 'building-cost-items';
  Object.entries(cost).forEach(([res, amt]) => {
    const item = document.createElement('span');
    const current = Number(state[res] || 0);
    const enough = current >= amt;
    item.className = `building-cost-item ${enough ? 'enough' : 'missing'}`;
    item.textContent = `${amt} ${res}`;
    wrapper.appendChild(item);
  });
  return wrapper;
}

function createTooltip({ card, desc, currentEffect, nextEffect, requirementText, locked, maxed }) {
  const tooltip = document.createElement('div');
  tooltip.className = 'building-tooltip';

  const tooltipDesc = document.createElement('div');
  tooltipDesc.className = 'building-tooltip-desc';
  tooltipDesc.textContent = desc;
  tooltip.appendChild(tooltipDesc);

  if (currentEffect) {
    const line = document.createElement('div');
    line.className = 'building-tooltip-line';
    const label = document.createElement('span');
    label.className = 'building-tooltip-label';
    label.textContent = 'Current';
    line.append(label, document.createTextNode(currentEffect));
    tooltip.appendChild(line);
  }

  if (nextEffect) {
    const line = document.createElement('div');
    line.className = 'building-tooltip-line';
    const label = document.createElement('span');
    label.className = 'building-tooltip-label';
    label.textContent = 'Next';
    line.append(label, document.createTextNode(nextEffect));
    tooltip.appendChild(line);
  } else if (maxed) {
    const line = document.createElement('div');
    line.className = 'building-tooltip-line';
    const label = document.createElement('span');
    label.className = 'building-tooltip-label';
    label.textContent = 'Max';
    line.append(label, document.createTextNode('Level cap reached')); 
    tooltip.appendChild(line);
  }

  if (locked && requirementText) {
    const line = document.createElement('div');
    line.className = 'building-tooltip-line';
    const label = document.createElement('span');
    label.className = 'building-tooltip-label';
    label.textContent = 'Requires';
    line.append(label, document.createTextNode(requirementText));
    tooltip.appendChild(line);
  }

  card.appendChild(tooltip);
}

function renderBuildings(state){
  const container = document.getElementById('buildingsContainer');
  if(!container) return;
  container.innerHTML = '';
  container.classList.add('building-grid');
  const realm = state.realm || { tier: 0, stage: 1 };
  for(const [key, b] of Object.entries(SECT_BUILDINGS)){
    const level = getBuildingLevel(key, state);
    const next = level + 1;
    const maxed = level >= b.maxLevel;
    const requirementText = formatRequirement(b.unlockReq);
    const unlocked = level > 0 || meetsRequirement(realm, b.unlockReq);
    const locked = !unlocked;

    const card = document.createElement('div');
    card.className = 'building-card';
    card.tabIndex = 0;
    card.classList.add(locked ? 'locked' : 'unlocked');
    if (maxed) card.classList.add('maxed');

    let cost = null;
    if (!maxed) {
      cost = getBuildingCost(key, next);
    }

    const affordable = Boolean(!locked && !maxed && cost && Object.entries(cost).every(([res, amt]) => (state[res] || 0) >= amt));
    if (!locked && !maxed) {
      card.classList.add(affordable ? 'affordable' : 'unaffordable');
    }

    const header = document.createElement('div');
    header.className = 'building-header';

    const icon = document.createElement('div');
    icon.className = 'building-icon';
    icon.textContent = b.icon;
    header.appendChild(icon);

    const info = document.createElement('div');
    info.className = 'building-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'building-name';
    nameEl.textContent = b.name;
    info.appendChild(nameEl);

    const levelEl = document.createElement('div');
    levelEl.className = 'building-level';
    levelEl.textContent = `Lv ${Math.min(level, b.maxLevel)}/${b.maxLevel}`;
    info.appendChild(levelEl);

    header.appendChild(info);
    card.appendChild(header);

    const footer = document.createElement('div');
    footer.className = 'building-footer';

    const costDiv = document.createElement('div');
    costDiv.className = 'building-cost';
    if (locked && level === 0) {
      costDiv.textContent = requirementText ? `Requires ${requirementText}` : 'Locked';
    } else if (maxed) {
      costDiv.textContent = 'Max level';
    } else if (cost) {
      const label = document.createElement('span');
      label.className = 'building-cost-label';
      label.textContent = 'Cost';
      costDiv.appendChild(label);
      costDiv.appendChild(createCostItems(cost, state));
    }
    footer.appendChild(costDiv);

    const btn = document.createElement('button');
    btn.className = 'btn small';
    btn.textContent = maxed ? 'Max' : (locked && level === 0 ? 'Locked' : 'Upgrade');

    const actionable = !locked && !maxed;
    if (!actionable) {
      btn.disabled = true;
      btn.classList.add('disabled');
    }

    btn.addEventListener('click', () => {
      if (!actionable) return;
      if (!canUpgrade(state.sect.buildings, state, state, key)) {
        log('Not enough materials for that upgrade.', 'bad');
        return;
      }
      if(upgradeBuilding(state, key)){
        render(state);
        updateActivitySelectors(state);
      }
    });

    footer.appendChild(btn);
    card.appendChild(footer);

    const currentEffect = level > 0 ? b.effects[level]?.desc : null;
    const nextEffect = !maxed ? (b.effects[next]?.desc || null) : null;

    createTooltip({
      card,
      desc: b.desc,
      currentEffect,
      nextEffect,
      requirementText,
      locked,
      maxed,
    });

    container.appendChild(card);
  }
}

function render(state){
  renderBuildings(state);
}

export function mountSectUI(state){
  on('RENDER', () => render(state));
  render(state);
}
