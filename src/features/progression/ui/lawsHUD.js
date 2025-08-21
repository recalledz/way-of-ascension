/* global updateYinYangVisual, updateBreathingStats, updateLotusFoundationFill */
import { updateLawsDisplay } from './lawDisplay.js';

export function updateLawsUI() {
  updateLawsDisplay();
  if (typeof updateYinYangVisual === 'function') updateYinYangVisual();
  if (typeof updateBreathingStats === 'function') updateBreathingStats();
  if (typeof updateLotusFoundationFill === 'function') updateLotusFoundationFill();
}
