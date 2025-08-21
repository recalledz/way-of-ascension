export default {
  fields: {
    costQi: { min: 0 },
    cooldownMs: { min: 0 },
    castTimeMs: { min: 0 }
  },
  monotonic: [
    { field: 'costQi', direction: 'nondecreasing' },
    { field: 'cooldownMs', direction: 'nondecreasing' }
  ]
};
