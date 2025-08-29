import { S, save } from '../../../shared/state.js';

const STORAGE_KEY = 'astralTreeAllocated';
const LINK_STORAGE_KEY = 'astralTreeLinks';
const START_NODES = new Set([1, 2, 3, 4, 5]);

const BASIC_ROTATION = [
  { desc: '+2% Foundation Gain', bonus: { foundationGainPct: 2 } },
  { desc: '+2% Cultivation Speed', bonus: { cultivationSpeedPct: 2 } },
  { desc: '+2% Manual Comprehension', bonus: { manualComprehensionPct: 2 } },
  { desc: '+1% Breakthrough Chance', bonus: { breakthroughChancePct: 1 } },
  { desc: '+2% Qi Regeneration', bonus: { qiRegenPct: 2 } },
  { desc: '2% max qi', bonus: { maxQiPct: 2 } },
];

const NOTABLES = {
  50: {
    effects: ['+12% Manual Comprehension', '+10% Cultivation Speed'],
    bonus: { manualComprehensionPct: 12, cultivationSpeedPct: 10 },
  },
  75: {
    effects: ['+20% Manual Comprehension', '+10% Cast Speed', '+10% Spell Damage'],
    bonus: { manualComprehensionPct: 20, castSpeedPct: 10, spellDamagePct: 10 },
  },
  76: {
    effects: ['+18% Summon Damage', 'Your summons taunt on their first hit (10s cd)', '+10% Gathering Speed'],
    bonus: { summonDamagePct: 18, summonTaunt: true, gatheringSpeedPct: 10 },
  },
  82: {
    effects: ['+22% Armor', '−12% Cooldowns', 'Cannot be Stunned while Qi Shield > 0'],
    bonus: { armorPct: 22, cooldownPct: -12, stunImmuneShield: true },
  },
  90: {
    effects: ['+20% Accuracy', '+10% Physical Penetration', 'Auras reserve −10% Qi'],
    bonus: { accuracyPct: 20, physicalPenPct: 10, auraReservePct: -10 },
  },
  91: {
    effects: ['Gain additional Physical Bonus Damage equal to (100% − your current Breakthrough Chance) on hit'],
    bonus: { thresholdFury: true },
  },
  100: {
    effects: ['+18% Fire Damage', 'After using an ability: +30% Attack Speed for 4s (8s cd)'],
    bonus: { fireDamagePct: 18, tempoAttackSpeedPct: 30 },
  },
  101: {
    effects: ['+12% Physical Damage', 'Hits vs Ignited enemies: +25% Stun', '+10% Fire Resistance'],
    bonus: { physicalDamagePct: 12, igniteStunPct: 25, fireResistPct: 10 },
  },
  109: {
    effects: ['+18% Crit Damage', '+4% Crit Chance', 'After a Critical Strike: +20% Dodge for 2s (8s cd)'],
    bonus: { critDamagePct: 18, critChancePct: 4, critDodgeBuffPct: 20 },
  },
  110: {
    effects: ['+15% Attack Speed', '+10% Cast Speed'],
    bonus: { attackSpeedPct: 15, castSpeedPct: 10 },
  },
};

function buildManifest(nodes) {
  const manifest = {};
  const basicIds = nodes
    .filter(n => n.type === 'basic')
    .map(n => n.id)
    .sort((a, b) => a - b);
  basicIds.forEach((id, idx) => {
    const rot = BASIC_ROTATION[idx % BASIC_ROTATION.length];
    manifest[id] = { cost: 10, effects: [rot.desc], bonus: rot.bonus };
  });
  Object.entries(NOTABLES).forEach(([id, data]) => {
    manifest[Number(id)] = { cost: 30, ...data };
  });
  return manifest;
}

function loadAllocations() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveAllocations(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  save();
}

function loadLinks() {
  try {
    const arr = JSON.parse(localStorage.getItem(LINK_STORAGE_KEY) || '[]');
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveLinks(set) {
  localStorage.setItem(LINK_STORAGE_KEY, JSON.stringify([...set]));
  save();
}

export function mountAstralTreeUI() {
  const openBtn = document.getElementById('openAstralTree');
  const overlay = document.getElementById('astralSkillTreeOverlay');
  const closeBtn = document.getElementById('closeAstralTree');
  if (!openBtn || !overlay || !closeBtn) return;

  openBtn.addEventListener('click', () => {
    overlay.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  buildTree().catch(err => console.error('Failed to build Astral Tree', err));
}

async function buildTree() {
  const svg = document.getElementById('astralTreeSvg');
  if (!svg) return;
  svg.innerHTML = '';
  const tooltip = document.getElementById('astralTooltip');

  function showTooltip(evt, text) {
    if (!tooltip) return;
    tooltip.textContent = text;
    tooltip.style.left = `${evt.pageX + 10}px`;
    tooltip.style.top = `${evt.pageY + 10}px`;
    tooltip.style.display = 'block';
  }

  function moveTooltip(evt) {
    if (!tooltip) return;
    tooltip.style.left = `${evt.pageX + 10}px`;
    tooltip.style.top = `${evt.pageY + 10}px`;
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = 'none';
  }

  const res = await fetch(new URL('../data/astral_tree.json', import.meta.url));
  const treeData = await res.json();

  const nodes = treeData.nodes;
  const edges = treeData.edges;
  const manifest = buildManifest(nodes);

  const nodeById = {};
  nodes.forEach(n => (nodeById[n.id] = n));

  const adj = {};
  edges.forEach(e => {
    adj[e.from] = adj[e.from] || [];
    adj[e.from].push(e.to);
    adj[e.to] = adj[e.to] || [];
    adj[e.to].push(e.from);
  });

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - 50;
  const maxX = Math.max(...xs) + 50;
  const minY = Math.min(...ys) - 50;
  const maxY = Math.max(...ys) + 50;
  svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

  const allocated = loadAllocations();
  const links = loadLinks();
  S.astralTreeBonuses = {};
  allocated.forEach(id => applyEffects(id, manifest));

  const nodeEls = {};
  const edgeEls = {};

  edges.forEach(e => {
    const a = nodeById[e.from];
    const b = nodeById[e.to];
    if (!a || !b) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('class', `connector ${a.group.toLowerCase()}`);
    const key = edgeKey(e.from, e.to);
    line.addEventListener('click', () => {
      if (!isEdgeAllocatable(e.from, e.to, allocated, links)) return;
      links.add(key);
      saveLinks(links);
      refreshClasses();
    });
    edgeEls[key] = line;
    svg.appendChild(line);
  });

  nodes.forEach(n => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    const r = n.type === 'notable' ? 8 : 4;
    circle.setAttribute('r', r);
    circle.setAttribute('class', `node ${n.group.toLowerCase()} ${n.type}`);

    const eff = manifest[n.id];
    const tooltipLines = [n.label];
    if (eff) {
      tooltipLines.push(`Cost: ${eff.cost}`);
      tooltipLines.push(...eff.effects);
    }
    const ttText = tooltipLines.join('\n');

    circle.addEventListener('mouseenter', e => showTooltip(e, ttText));
    circle.addEventListener('mousemove', moveTooltip);
    circle.addEventListener('mouseleave', hideTooltip);
    circle.addEventListener('click', () => {
      if (!isNodeAllocatable(n.id, allocated, links, adj)) return;
      allocated.add(n.id);
      applyEffects(n.id, manifest);
      saveAllocations(allocated);
      refreshClasses();
      hideTooltip();
    });

    nodeEls[n.id] = circle;
    svg.appendChild(circle);
  });

  function refreshClasses() {
    nodes.forEach(n => {
      const el = nodeEls[n.id];
      el.classList.toggle('taken', allocated.has(n.id));
      el.classList.toggle('allocatable', isNodeAllocatable(n.id, allocated, links, adj));
    });
    edges.forEach(e => {
      const key = edgeKey(e.from, e.to);
      const el = edgeEls[key];
      el.classList.toggle('taken', links.has(key));
      el.classList.toggle('allocatable', isEdgeAllocatable(e.from, e.to, allocated, links));
    });
  }

  refreshClasses();
}

function isNodeAllocatable(id, allocated, links, adj) {
  if (allocated.has(id)) return false;
  if (START_NODES.has(id)) return true;
  const neighbors = adj[id] || [];
  return neighbors.some(n => allocated.has(n) && links.has(edgeKey(n, id)));
}

function isEdgeAllocatable(a, b, allocated, links) {
  const key = edgeKey(a, b);
  if (links.has(key)) return false;
  const hasA = allocated.has(a);
  const hasB = allocated.has(b);
  return (hasA && !hasB) || (hasB && !hasA);
}

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function applyEffects(id, manifest) {
  const info = manifest[id];
  if (!info || !info.bonus) return;
  const bonuses = S.astralTreeBonuses || (S.astralTreeBonuses = {});
  for (const [k, v] of Object.entries(info.bonus)) {
    bonuses[k] = (bonuses[k] || 0) + v;
  }
}

