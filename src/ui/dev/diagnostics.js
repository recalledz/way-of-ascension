import { configReport } from "../../config.js";
import { listFeatureVisibility } from "../../features/index.js";

export function mountDiagnostics(state) {
  const initial = configReport();

  const hud = document.createElement('div');
  hud.id = 'diagnosticsHud';
  Object.assign(hud.style, {
    position: 'fixed', bottom: '6px', right: '6px', width: '12px', height: '12px',
    borderRadius: '50%', zIndex: 10000, cursor: 'pointer',
    background: initial.isProd ? 'red' : 'green'
  });
  document.body.appendChild(hud);

  const modal = document.createElement('div');
  modal.id = 'diagnosticsModal';
  Object.assign(modal.style, {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', color: '#fff',
    font: '12px monospace', display: 'none', overflow: 'auto',
    padding: '20px', zIndex: 9999
  });
  document.body.appendChild(modal);

  function render() {
    const report = configReport();
    const vis = listFeatureVisibility(state);

    let html = '';
    if (report.warnings.length) {
      html += `<div style="color:orange"><strong>Warnings:</strong><br>${report.warnings.join('<br>')}</div>`;
    }
    html += '<h2>Flags</h2>';
    html += '<table border="1" cellpadding="4" cellspacing="0"><tr><th>key</th><th>raw</th><th>parsed</th><th>source</th></tr>';
    for (const [k,v] of Object.entries(report.flags)) {
      html += `<tr><td>${k}</td><td>${v.rawValue ?? ''}</td><td>${v.parsedValue}</td><td>${v.source}</td></tr>`;
    }
    html += '</table>';

    html += '<h2>Visibility</h2>';
    html += '<table border="1" cellpadding="4" cellspacing="0"><tr><th>feature</th><th>flag</th><th>reason</th></tr>';
    for (const [k,v] of Object.entries(vis)) {
      html += `<tr><td>${k}</td><td>${v.flagAllowed}</td><td>${v.reason}</td></tr>`;
    }
    html += '</table>';

    html += '<div style="margin-top:10px"><button id="diagClose">Close</button></div>';
    modal.innerHTML = html;
    modal.querySelector('#diagClose').onclick = () => { modal.style.display = 'none'; };
  }

  function open() {
    render();
    modal.style.display = 'block';
  }

  hud.addEventListener('click', open);
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      open();
    }
  });
}
