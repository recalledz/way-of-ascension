import { on, emit } from '../shared/events.js';

function ensureNotifications(state) {
  if (!Array.isArray(state.notifications)) {
    state.notifications = [];
  }
  return state.notifications;
}

export function addNotification(state, notif) {
  const notifications = ensureNotifications(state);
  const idx = notifications.findIndex(n => n.id === notif.id);
  if (idx !== -1) {
    notifications[idx] = { ...notifications[idx], ...notif };
  } else {
    notifications.push(notif);
  }
  emit('NOTIFICATIONS_CHANGED');
}

export function dismissNotification(state, id) {
  const notifications = ensureNotifications(state);
  const idx = notifications.findIndex(n => n.id === id);
  if (idx !== -1 && notifications[idx].dismissible !== false) {
    notifications.splice(idx, 1);
    emit('NOTIFICATIONS_CHANGED');
  }
}

export function mountNotificationTray(state) {
  const notifications = ensureNotifications(state);
  if (document.getElementById('notificationsOverlay')) return;
  const tray = document.getElementById('notificationTray');
  const header = document.getElementById('notificationHeader');

  const overlay = document.createElement('div');
  overlay.id = 'notificationsOverlay';
  overlay.className = 'modal-overlay';
  overlay.style.display = 'none';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const card = document.createElement('div');
  card.className = 'modal-content notification-card';

  const cardHeader = document.createElement('div');
  cardHeader.className = 'card-header';
  const title = document.createElement('h4');
  title.textContent = 'Notifications';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn small ghost';
  closeBtn.textContent = '×';
  cardHeader.append(title, closeBtn);
  card.appendChild(cardHeader);

  const list = document.createElement('div');
  list.id = 'notificationList';
  card.appendChild(list);

  overlay.append(backdrop, card);
  document.body.appendChild(overlay);

  function openOverlay() {
    renderOverlay();
    overlay.style.display = 'flex';
  }
  function closeOverlay() {
    overlay.style.display = 'none';
  }
  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);
  header?.addEventListener('click', openOverlay);

  function renderTray() {
    if (!tray) return;
    tray.innerHTML = '';
    notifications.slice(0, 3).forEach(n => {
      const item = document.createElement('div');
      item.className = 'notification';
      item.textContent = n.text;
      if (n.dismissible !== false) {
        const x = document.createElement('span');
        x.className = 'dismiss';
        x.textContent = '×';
        x.addEventListener('click', e => {
          e.stopPropagation();
          dismissNotification(state, n.id);
        });
        item.appendChild(x);
      }
      item.addEventListener('click', e => {
        if (n.id === 'objective') {
          e.stopPropagation();
          emit('OPEN_TUTORIAL');
        } else {
          openOverlay();
        }
      });
      tray.appendChild(item);
    });
  }

  function renderOverlay() {
    list.innerHTML = '';
    notifications.forEach(n => {
      const row = document.createElement('div');
      row.className = 'notification';
      row.textContent = n.text;
      if (n.dismissible !== false) {
        const x = document.createElement('span');
        x.className = 'dismiss';
        x.textContent = '×';
        x.addEventListener('click', () => dismissNotification(state, n.id));
        row.appendChild(x);
      }
      if (n.id === 'objective') {
        row.addEventListener('click', () => {
          emit('OPEN_TUTORIAL');
          closeOverlay();
        });
      }
      list.appendChild(row);
    });
  }

  on('NOTIFICATIONS_CHANGED', renderTray);
  on('NOTIFICATIONS_CHANGED', renderOverlay);
  renderTray();
}
