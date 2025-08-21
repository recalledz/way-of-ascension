export default {
  fields: {
    tier: { min: 0 }
  },
  monotonic: [
    { field: 'tier', direction: 'nondecreasing' },
    { field: 'tier', direction: 'nondecreasing' }
  ]
};
