const STORAGE_KEY = 'astralTreeAllocated';

export function unlockAstralNode(id) {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }
  } catch {
    /* ignore */
  }
}

