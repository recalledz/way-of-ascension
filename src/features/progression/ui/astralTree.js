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

  buildTree();
}

function buildTree() {
  const svg = document.getElementById('astralTreeSvg');
  if (!svg) return;

  const width = 1000;
  const height = 1000;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const nodes = [];
  const edges = [];

  const center = { id: 'hub', x: width / 2, y: height / 2, type: 'hub' };
  nodes.push(center);

  const elements = [
    { name: 'Wood', cls: 'wood', angle: -90 },
    { name: 'Fire', cls: 'fire', angle: -18 },
    { name: 'Earth', cls: 'earth', angle: 54 },
    { name: 'Metal', cls: 'metal', angle: 126 },
    { name: 'Water', cls: 'water', angle: 198 }
  ];

  const startNodes = [];

  elements.forEach(el => {
    const rad = (el.angle * Math.PI) / 180;
    const sx = center.x + Math.cos(rad) * 100;
    const sy = center.y + Math.sin(rad) * 100;
    const startId = `${el.name.toLowerCase()}-start`;
    nodes.push({ id: startId, x: sx, y: sy, type: 'start', element: el.cls });
    edges.push({ from: center.id, to: startId, element: el.cls });
    startNodes.push(startId);

    const regionX = center.x + Math.cos(rad) * 260;
    const regionY = center.y + Math.sin(rad) * 260;

    for (let c = 0; c < 2; c++) {
      const offsetAngle = rad + ((c === 0 ? -30 : 30) * Math.PI) / 180;
      const nx = regionX + Math.cos(offsetAngle) * 60;
      const ny = regionY + Math.sin(offsetAngle) * 60;
      const notableId = `${el.name.toLowerCase()}-notable-${c}`;
      nodes.push({ id: notableId, x: nx, y: ny, type: 'notable', element: el.cls });
      edges.push({ from: startId, to: notableId, element: el.cls });

      const clusterSize = 4;
      let prev = notableId;
      let first = null;
      for (let i = 0; i < clusterSize; i++) {
        const ang = (Math.PI * 2 * i) / clusterSize;
        const cx = nx + Math.cos(ang) * 30;
        const cy = ny + Math.sin(ang) * 30;
        const nodeId = `${el.name.toLowerCase()}-${c}-node-${i}`;
        nodes.push({ id: nodeId, x: cx, y: cy, type: 'stat', element: el.cls });
        edges.push({ from: prev, to: nodeId, element: el.cls });
        prev = nodeId;
        if (i === 0) first = nodeId;
      }
      edges.push({ from: prev, to: first, element: el.cls });
      edges.push({ from: first, to: `${el.name.toLowerCase()}-${c}-node-2`, element: el.cls });
    }
  });

  for (let i = 0; i < startNodes.length; i++) {
    const from = startNodes[i];
    const to = startNodes[(i + 1) % startNodes.length];
    edges.push({ from, to, element: 'link' });
  }

  edges.forEach(edge => {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);
    if (!from || !to) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('class', `connector ${edge.element}`);
    svg.appendChild(line);
  });

  nodes.forEach(node => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    const r = node.type === 'notable' ? 8 : node.type === 'start' ? 6 : 4;
    circle.setAttribute('r', r);
    circle.setAttribute('class', `node ${node.element || ''} ${node.type}`);
    svg.appendChild(circle);
  });
}

