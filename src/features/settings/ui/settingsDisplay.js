import { setText } from '../../../shared/utils/dom.js';

let startTime = performance.now();

export function setupSettingsTabs() {
  const buttons = document.querySelectorAll('.settings-tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      buttons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.settings-tab-content').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
      });
      btn.classList.add('active');
      const content = document.getElementById(`${tab}SettingsTab`);
      if (content) {
        content.classList.add('active');
        content.style.display = 'block';
      }
    });
  });
}

export function updateSettingsStats() {
  const elapsed = Math.floor((performance.now() - startTime) / 1000);
  setText('timeSinceStart', `${elapsed}s`);
}
