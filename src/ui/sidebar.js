export function renderSidebarActivities() {
  const sidebarActivities = [
    {
      id: 'cultivation',
      label: 'Cultivation',
      icon: '<iconify-icon icon="mdi:flower-lotus" class="ui-icon" style="color:#16a34a"></iconify-icon>',
      group: 'leveling',
      levelId: 'cultivationLevel',
      initialLevel: 'Mortal 1',
      progressFillId: 'cultivationProgressFill',
      progressTextId: 'cultivationProgressText',
      cost: {}
    },
    {
      id: 'physique',
      label: 'Physique',
      icon: '<iconify-icon icon="hugeicons:body-part-muscle" class="ui-icon" width="20"></iconify-icon>',
      group: 'leveling',
      levelId: 'physiqueLevel',
      initialLevel: 'Level 1',
      progressFillId: 'physiqueProgressFill',
      progressTextId: 'physiqueProgressText',
      cost: {}
    },
    {
      id: 'mining',
      label: 'Mining',
      icon: '<iconify-icon icon="hugeicons:mining-02" class="ui-icon" width="20"></iconify-icon>',
      group: 'leveling',
      levelId: 'miningLevel',
      initialLevel: 'Level 1',
      progressFillId: 'miningProgressFill',
      progressTextId: 'miningProgressText',
      cost: {}
    },
    {
      id: 'cooking',
      label: 'Cooking',
      icon: '<iconify-icon icon="ep:food" class="ui-icon" width="20"></iconify-icon>',
      group: 'leveling',
      levelId: 'cookingLevelSidebar',
      initialLevel: 'Level 1',
      progressFillId: 'cookingProgressFillSidebar',
      progressTextId: 'cookingProgressTextSidebar',
      cost: {}
    },
    {
      id: 'alchemy',
      label: 'Alchemy',
      icon: '<iconify-icon icon="mdi:flask" class="ui-icon" width="20"></iconify-icon>',
      group: 'leveling',
      levelId: 'alchemyLevelSidebar',
      initialLevel: 'Level 1',
      cost: {},
    },
    {
      id: 'adventure',
      label: 'Adventure',
      icon: '<iconify-icon icon="lucide:mountain" class="ui-icon"></iconify-icon>',
      group: 'management',
      levelId: 'adventureLevel',
      initialLevel: 'Zone 1',
      progressFillId: 'adventureProgressFill',
      progressTextId: 'adventureProgressText',
      cost: {}
    },
    {
      id: 'character',
      label: 'Character',
      icon: '<iconify-icon icon="healthicons:head-outline" class="ui-icon" width="20"></iconify-icon>',
      group: 'management',
      levelId: 'characterLevel',
      initialLevel: 'Gear',
      cost: {}
    },
    {
      id: 'sect',
      label: 'Sect',
      icon: '🏛️',
      group: 'management',
      levelId: 'sectLevel',
      initialLevel: 'Buildings',
      statusId: 'sectStatus',
      cost: {}
    }
  ];

  const levelingContainer = document.getElementById('levelingActivities');
  const managementContainer = document.getElementById('managementActivities');

  sidebarActivities.forEach(act => {
    const container = act.group === 'leveling' ? levelingContainer : managementContainer;
    if (!container) return;

    const item = document.createElement('div');
    item.className = `activity-item ${act.group === 'leveling' ? 'leveling-tab' : 'management-tab'}`;
    item.dataset.activity = act.id;

    let html = `
      <div class="activity-header">
        <div class="activity-icon">${act.icon}</div>
        <div class="activity-info">
          <div class="activity-name">${act.label}</div>
          <div class="activity-level" id="${act.levelId}">${act.initialLevel}</div>
        </div>
      </div>`;

    if (act.progressFillId && act.progressTextId) {
      html += `
      <div class="activity-progress-bar">
        <div class="progress-fill" id="${act.progressFillId}"></div>
        <div class="progress-text" id="${act.progressTextId}">0%</div>
      </div>`;
    }

    if (act.statusId) {
      html += `
      <div class="activity-status">
        <div class="status-indicator" id="${act.statusId}">Inactive</div>
      </div>`;
    }

    item.innerHTML = html;
    container.appendChild(item);
  });
}
