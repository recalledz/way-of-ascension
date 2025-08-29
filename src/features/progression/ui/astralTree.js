import { applyEffectsForNode, applyAllAllocated, getEffectsForNode } from '../astralTreeLogic.js';

export function mountAstralTreeUI(state) {
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

  // ensure effects applied from saved allocation
  applyAllAllocated(state);
  buildTree(state);
}

async function buildTree(state) {
  const svg = document.getElementById('astralTreeSvg');
  if (!svg) return;
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '-1000 -1000 2000 2000');

  const res = await fetch('astral_tree.json');
  const data = await res.json();
  const nodes = data.nodes || [];
  const edges = data.edges || [];

  const nodeMap = new Map();
  const adj = new Map();
  nodes.forEach(n => {
    nodeMap.set(n.id, n);
    adj.set(n.id, new Set());
  });
  const edgeSet = new Set();
  edges.forEach(e => {
    const key = e.from + '-' + e.to;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    const a = e.from, b = e.to;
    adj.get(a)?.add(b);
    adj.get(b)?.add(a);
  });

  function isTaken(id) {
    return state.astral.allocated.includes(id);
  }
  function isAllocatable(id) {
    if (isTaken(id)) return false;
    const neighbors = adj.get(id);
    if (!neighbors) return false;
    for (const n of neighbors) if (isTaken(n)) return true;
    return false;
  }

  edges.forEach(e => {
    const from = nodeMap.get(e.from);
    const to = nodeMap.get(e.to);
    if (!from || !to) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    const cls = from.group ? from.group.toLowerCase() : '';
    line.setAttribute('class', 'connector ' + cls);
    svg.appendChild(line);
  });

  nodes.forEach(n => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    const r = n.type === 'notable' ? 8 : 5;
    circle.setAttribute('r', r);
    let cls = 'node';
    if (n.group) cls += ' ' + n.group.toLowerCase();
    if (isTaken(n.id)) cls += ' taken';
    else if (isAllocatable(n.id)) cls += ' allocatable';
    circle.setAttribute('class', cls);
    circle.dataset.id = n.id;

    const effects = getEffectsForNode(n.id) || [];
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = n.label + '\n' + effects.map(e => e.text).join('\n');
    circle.appendChild(title);

    circle.addEventListener('click', () => {
      if (!isAllocatable(n.id)) return;
      const cost = n.type === 'notable' ? 30 : 10;
      if ((state.insight || 0) < cost) return;
      state.insight -= cost;
      state.astral.allocated.push(n.id);
      applyEffectsForNode(state, n.id);
      buildTree(state);
    });
    svg.appendChild(circle);
  });
}
