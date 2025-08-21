export default {
  fields: {
    maxLevel: { min: 1 },
    baseCost: { min: 0 }
  },
  monotonic: [
    { field: 'maxLevel', direction: 'nondecreasing' },
    { field: 'baseCost', direction: 'nondecreasing' }
  ]
};
