const KEY = "woa:save:v1";
export function loadSave(defaultState){ try{ const raw = localStorage.getItem(KEY); return raw ? {...defaultState, ...JSON.parse(raw)} : defaultState; }catch{ return defaultState; } }
let saveTimer;
export function saveDebounced(state){ clearTimeout(saveTimer); saveTimer = setTimeout(() => { try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch{} }, 300); }
export function cancelSaveDebounce(){ clearTimeout(saveTimer); }
