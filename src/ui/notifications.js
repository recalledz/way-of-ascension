import { on, emit } from '../shared/events.js';

export function setNotification(state, notif) {
  if (!state.notifications) state.notifications = [];
  const idx = state.notifications.findIndex(n => n.id === notif.id);
  if (idx >= 0) {
    state.notifications[idx] = { ...state.notifications[idx], ...notif };
  } else {
    state.notifications.push(notif);
  }
  emit('RENDER');
}

export function removeNotification(state, id) {
  if (!state.notifications) return;
  const idx = state.notifications.findIndex(n => n.id === id);
  if (idx >= 0) {
    state.notifications.splice(idx, 1);
    emit('RENDER');
  }
}

export function mountNotifications(state) {
  if (document.getElementById('notificationsOverlay')) return;
  const tray = document.getElementById('notificationsTray');
  const header = document.getElementById('notificationsHeader');
  if (!tray || !header) return;

  const overlay = document.createElement('div');
  overlay.id = 'notificationsOverlay';
  overlay.className = 'modal-overlay';
  overlay.style.display = 'none';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const card = document.createElement('div');
  card.className = 'modal-content';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn small ghost';
  closeBtn.textContent = '×';
  const list = document.createElement('div');
  list.className = 'notifications-list';
  card.append(closeBtn, list);
  overlay.append(backdrop, card);
  document.body.appendChild(overlay);

  function renderTray() {
    const notifs = state.notifications || [];
    if (notifs.length === 0) {
      tray.style.display = 'none';
      header.style.display = 'none';
      return;
    }
    tray.style.display = 'block';
    header.style.display = 'block';
    tray.innerHTML = '';
    notifs.slice(0, 3).forEach(n => {
      const item = document.createElement('div');
      item.className = 'notification-item';
      item.textContent = n.text;
      if (n.dismissible !== false) {
        const btn = document.createElement('button');
        btn.className = 'dismiss-btn';
        btn.textContent = '×';
        btn.addEventListener('click', e => {
          e.stopPropagation();
          removeNotification(state, n.id);
        });
        item.appendChild(btn);
      }
      tray.appendChild(item);
    });
  }

  function renderOverlay() {
    const notifs = state.notifications || [];
    list.innerHTML = '';
    notifs.forEach(n => {
      const item = document.createElement('div');
      item.className = 'notification-item';
      item.textContent = n.text;
      item.addEventListener('click', () => {
        overlay.style.display = 'none';
        n.onClick?.();
      });
      if (n.dismissible !== false) {
        const btn = document.createElement('button');
        btn.className = 'dismiss-btn';
        btn.textContent = '×';
        btn.addEventListener('click', e => {
          e.stopPropagation();
          removeNotification(state, n.id);
        });
        item.appendChild(btn);
      }
      list.appendChild(item);
    });
  }

  function render() {
    renderTray();
    if (overlay.style.display !== 'none') renderOverlay();
  }

  function openOverlay() {
    overlay.style.display = 'flex';
    renderOverlay();
  }

  function closeOverlay() {
    overlay.style.display = 'none';
  }

  tray.addEventListener('click', openOverlay);
  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  on('RENDER', render);
  render();
}
