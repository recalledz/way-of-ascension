import { qs } from '../../../shared/utils/dom.js';

function buildTree(svg){
  const width = svg.clientWidth;
  const height = svg.clientHeight;
  const cx = width / 2;
  const cy = height / 2;
  const ns = 'http://www.w3.org/2000/svg';

  const regions = [
    { key: 'wood', color: '#3fa34d', angle: -90 },
    { key: 'fire', color: '#e74c3c', angle: -18 },
    { key: 'earth', color: '#8b4513', angle: 54 },
    { key: 'metal', color: '#c0c0c0', angle: 126 },
    { key: 'water', color: '#3498db', angle: 198 }
  ];

  const nodes = [];
  const nodeMap = {};
  const edges = [];
  const connectorWidth = 1.5;

  function radiusFor(type){
    return type === 'hub' ? 10 : type === 'notable' ? 8 : type === 'start' ? 6 : 4;
  }

  function addNode(node){
    node.r = radiusFor(node.type);
    nodes.push(node);
    nodeMap[node.id] = node;
  }

  addNode({ id: 'hub', x: cx, y: cy, type: 'hub', color: '#ffffff' });

  regions.forEach(region => {
    const rad = region.angle * Math.PI / 180;
    const startX = cx + Math.cos(rad) * 100;
    const startY = cy + Math.sin(rad) * 100;
    const startId = `${region.key}-start`;
    addNode({ id: startId, x: startX, y: startY, type: 'start', color: region.color });
    edges.push(['hub', startId]);

    const clusterCenterX = cx + Math.cos(rad) * 220;
    const clusterCenterY = cy + Math.sin(rad) * 220;

    const clusterNodes = [];
    const numSmall = 8;
    for(let j=0;j<numSmall;j++){
      const offset = 2 * Math.PI * j / numSmall;
      const r = 40;
      const id = `${region.key}-n${j}`;
      const x = clusterCenterX + Math.cos(offset) * r;
      const y = clusterCenterY + Math.sin(offset) * r;
      addNode({ id, x, y, type: 'small', color: region.color });
      clusterNodes.push(id);
    }

    // Notables
    for(let j=0;j<2;j++){
      const id = `${region.key}-notable${j}`;
      const off = Math.PI * j;
      const x = clusterCenterX + Math.cos(off) * 80;
      const y = clusterCenterY + Math.sin(off) * 80;
      addNode({ id, x, y, type: 'notable', color: region.color });
    }

    // Connect start to two clusters
    edges.push([startId, clusterNodes[0]]);
    edges.push([startId, clusterNodes[4]]);

    // Cluster 1 loop
    for(let i=0;i<4;i++){
      const a = clusterNodes[i];
      const b = clusterNodes[(i+1)%4];
      edges.push([a,b]);
    }
    edges.push([clusterNodes[2], `${region.key}-notable0`]);
    edges.push([clusterNodes[3], `${region.key}-notable0`]);

    // Cluster 2 loop
    for(let i=4;i<8;i++){
      const a = clusterNodes[i];
      const b = clusterNodes[i===7?4:i+1];
      edges.push([a,b]);
    }
    edges.push([clusterNodes[5], `${region.key}-notable1`]);
    edges.push([clusterNodes[7], `${region.key}-notable1`]);

    // Connect clusters
    edges.push([clusterNodes[2], clusterNodes[4]]);
  });

  // Cross-links between regions
  for(let i=0;i<regions.length;i++){
    const cur = regions[i];
    const next = regions[(i+1)%regions.length];
    edges.push([`${cur.key}-notable1`, `${next.key}-start`]);
  }

  // Draw edges
  edges.forEach(([fromId,toId]) => {
    const a = nodeMap[fromId];
    const b = nodeMap[toId];
    if(!a || !b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const offsetA = a.r + connectorWidth / 2;
    const offsetB = b.r + connectorWidth / 2;
    const startX = a.x + (dx / dist) * offsetA;
    const startY = a.y + (dy / dist) * offsetA;
    const endX = b.x - (dx / dist) * offsetB;
    const endY = b.y - (dy / dist) * offsetB;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('stroke', a.color);
    line.classList.add('connector');
    line.style.filter = 'drop-shadow(0 0 2px ' + a.color + ')';
    svg.appendChild(line);
  });

  // Draw nodes
  nodes.forEach(n => {
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r', n.r);
    circle.setAttribute('fill', n.color);
    circle.classList.add('node');
    circle.style.filter = 'drop-shadow(0 0 4px ' + n.color + ')';
    if(n.type) circle.classList.add(n.type);
    svg.appendChild(circle);
  });
}

export function mountAstralTreeUI(state){
  const openBtn = qs('#openAstralTree');
  const overlay = qs('#astralSkillTreeOverlay');
  const closeBtn = qs('#closeAstralTree');
  const svg = qs('#astralSkillTreeSvg');
  if(!openBtn || !overlay || !closeBtn || !svg) return;

  function open(){
    overlay.style.display = 'flex';
    if(!svg.dataset.built){
      buildTree(svg);
      svg.dataset.built = '1';
    }
  }
  function close(){
    overlay.style.display = 'none';
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
}

