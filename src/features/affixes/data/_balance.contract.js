export default {
  fields: {
    multiplier: { min: 0 }
  },
  monotonic: [
    { field: 'multiplier', direction: 'nondecreasing' },
    { field: 'multiplier', direction: 'nonincreasing', allowEqual: true }
  ]
};
