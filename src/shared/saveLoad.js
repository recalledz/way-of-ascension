const KEY = "woa:save:v1";
export function loadSave(defaultState){ try{ const raw = localStorage.getItem(KEY); return raw ? {...defaultState, ...JSON.parse(raw)} : defaultState; }catch{ return defaultState; } }
let saveTimer;
let saveBlocked = false;
export function saveDebounced(state){
  if (saveBlocked) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch{}
  }, 300);
}
export function cancelSaveDebounce(){
  saveBlocked = true;
  clearTimeout(saveTimer);
}
