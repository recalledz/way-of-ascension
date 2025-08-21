export default {
  fields: {
    weight: { min: 0 }
  },
  monotonic: [
    { field: 'weight', direction: 'nondecreasing' },
    { field: 'weight', direction: 'nonincreasing', allowEqual: true }
  ]
};
