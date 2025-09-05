export function mountCultivationSidebar() {
  const container = document.getElementById('levelingActivities');
  if (!container) return;
  if (container.querySelector('.activity-item[data-activity="cultivation"]')) return;

  const item = document.createElement('div');
  item.className = 'activity-item leveling-tab';
  item.dataset.activity = 'cultivation';
  item.innerHTML = `
    <div class="activity-header">
      <div class="activity-icon"><iconify-icon icon="mdi:flower-lotus" class="ui-icon" style="color:#16a34a"></iconify-icon></div>
      <div class="activity-info">
        <div class="activity-name">Cultivation</div>
        <div class="activity-level" id="cultivationLevel">Mortal 1</div>
      </div>
    </div>
    <div class="activity-progress-bar">
      <div class="progress-fill" id="cultivationProgressFill"></div>
      <div class="progress-text" id="cultivationProgressText">0%</div>
    </div>
  `;
  container.appendChild(item);
}
