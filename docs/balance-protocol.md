# Balance Protocol

This repository uses **balance contracts** to describe the expected shape and
progression of numeric data used throughout the game. Each feature with a
`data/` directory includes a `_balance.contract.js` file that lists the fields
that must stay within certain ranges as the project evolves.

## Contract shape

A balance contract exports a plain object with two sections:

- `fields` – map of field names to validation rules. Rules may define
  `min`, `max`, `target` and `tolerance` values. Targets represent the
  design goal while tolerance describes how far actual data may deviate.
- `monotonic` – array of checks that ensure numeric values move in a single
  direction when ordered. These are useful for things like kill requirements
  that should always increase as the player progresses.

## Validation

`scripts/balance-validate.js` walks every feature that contains a `data/`
folder and loads the feature's `_balance.contract.js`. If any feature is
missing a contract or the contract fails to load, validation fails. The
validator is available through `npm run lint:balance` and is called from the
main structure validator.

## Example

```js
export default {
  fields: {
    weight: { min: 0, max: 100, target: 50, tolerance: 25 }
  },
  monotonic: [
    { field: 'weight', direction: 'nondecreasing' },
    { field: 'weight', direction: 'nonincreasing', allowEqual: true }
  ]
};
```

The example above ensures that each `weight` value stays within bounds and
demonstrates two simple monotonic checks.

