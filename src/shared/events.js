const listeners = new Map(); // type -> Set<fn>
export function on(type, fn){ if(!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); }
export function off(type, fn){ listeners.get(type)?.delete(fn); }
export function emit(type, payload){ listeners.get(type)?.forEach(fn => fn(payload)); }
