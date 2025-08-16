export interface StatusRule {
  duration: number;
  maxStacks: number;
  scale: 'physique' | 'agility' | 'mind';
}

export const STATUSES: Record<string, StatusRule> = {
  bleed: { duration: 5, maxStacks: 3, scale: 'physique' },
  stun: { duration: 1, maxStacks: 1, scale: 'physique' },
  burn: { duration: 4, maxStacks: 5, scale: 'mind' },
  spark: { duration: 2, maxStacks: 5, scale: 'mind' },
  weaken: { duration: 6, maxStacks: 1, scale: 'mind' },
};
