export const SWORD_DAMAGE_MULTIPLIER = 1.3;
export const SWORD_PROFICIENCY_BASE = 100;

export const WEAPON_CONFIG = {
  fist: { damageMultiplier: 1 },
  sword: { damageMultiplier: SWORD_DAMAGE_MULTIPLIER, proficiencyBase: SWORD_PROFICIENCY_BASE },
};

export const WEAPON_FLAGS = {
  fist: true,
  sword: false,
};

// WEAPONS-INTEGRATION
// CHANGELOG: Added configurable weapon data and feature flags.
