import { activityState } from './state.js';

export function isValidActivity(name) {
  return Object.prototype.hasOwnProperty.call(activityState, name);
}
